import { createHash } from 'node:crypto'

import { decode, encode } from 'gpt-tokenizer/encoding/cl100k_base'

export const DEFAULT_MAX_TOKENS = 800
export const DEFAULT_OVERLAP_TOKENS = 120
export const TOKENIZER_ENCODING = 'cl100k_base'

export type SourcePage = {
  page: number
  text: string
}

type TextUnit = {
  page: number
  sectionTitle?: string
  text: string
}

export type RagChunk = {
  id: string
  text: string
  pageStart: number
  pageEnd: number
  sections: string[]
  tokenCount: number
  embedding?: number[]
}

export type RagChunksFile = {
  schemaVersion: 1
  source: {
    filename: string
    path: string
    sha256: string
    pageCount: number
  }
  chunking: {
    tokenizer: typeof TOKENIZER_ENCODING
    maxTokens: number
    overlapTokens: number
  }
  embedding: {
    model: string
    dimensions: number
  } | null
  chunks: RagChunk[]
}

export function countTokens(text: string): number {
  return encode(text).length
}

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex')
}

function joinWrappedLine(left: string, right: string): string {
  if (/[-‐‑]$/.test(left) && /^[a-z]/.test(right)) return `${left}${right}`
  return `${left} ${right}`
}

function isListItem(line: string): boolean {
  return /^(?:[.•●▪◦·-]\s+|\d+[.)]\s+)/.test(line)
}

function normalizeListMarker(line: string): string {
  return line.replace(/^[.•●▪◦·]\s+/, '- ')
}

function isLikelyHeading(line: string): boolean {
  if (!line || line.length > 100 || isListItem(line) || /https?:\/\//i.test(line)) return false
  if (/[.,;!]$/.test(line)) return false

  const words = line.match(/[A-Za-z][A-Za-z'-]*/g) ?? []
  if (words.length === 0 || words.length > 14) return false
  const significantWords = words.filter(
    (word) => !/^(?:a|an|and|as|at|but|by|for|from|in|of|on|or|the|to|with)$/i.test(word),
  )
  const titleCaseWords = significantWords.filter((word) => /^[A-Z]/.test(word))
  const hasTitleCase =
    significantWords.length > 0 && titleCaseWords.length / significantWords.length >= 0.6

  if (line.endsWith('?')) return true
  if (line.endsWith(':')) return line.length <= 55 || hasTitleCase
  return line.length <= 45 || hasTitleCase
}

export function normalizePageText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\u0000/g, '')
    .replace(/\u00ad/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^-- \d+ of \d+ --$/gm, '')
    .trim()
}

function pagesToUnits(pages: SourcePage[]): TextUnit[] {
  const units: TextUnit[] = []
  let sectionTitle: string | undefined

  for (const page of pages) {
    const lines = normalizePageText(page.text).split('\n')
    let current = ''
    let currentIsListItem = false

    const flush = () => {
      const text = current.trim()
      if (text) units.push({ page: page.page, sectionTitle, text })
      current = ''
      currentIsListItem = false
    }

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) {
        flush()
        continue
      }

      if (isLikelyHeading(line)) {
        flush()
        sectionTitle = line
        units.push({ page: page.page, sectionTitle, text: line })
        continue
      }

      if (isListItem(line)) {
        flush()
        current = normalizeListMarker(line)
        currentIsListItem = true
        continue
      }

      if (currentIsListItem && /[.?!]$/.test(current)) {
        flush()
      } else if (current && /[.?!]$/.test(current) && current.length >= 100) {
        flush()
      }

      if (!current) {
        current = line
      } else {
        current = joinWrappedLine(current, line)
      }
    }

    flush()
  }

  return units
}

function splitOversizedUnit(unit: TextUnit, maxTokens: number, overlapTokens: number): TextUnit[] {
  const tokens = encode(unit.text)
  if (tokens.length <= maxTokens) return [unit]

  const step = maxTokens - overlapTokens
  const parts: TextUnit[] = []
  for (let start = 0; start < tokens.length; start += step) {
    const text = decode(tokens.slice(start, start + maxTokens)).trim()
    if (text) parts.push({ ...unit, text })
    if (start + maxTokens >= tokens.length) break
  }
  return parts
}

function unitsTokenCount(units: TextUnit[]): number {
  return countTokens(units.map((unit) => unit.text).join('\n\n'))
}

function overlapUnits(units: TextUnit[], overlapTokens: number): TextUnit[] {
  const overlap: TextUnit[] = []
  for (let index = units.length - 1; index >= 0; index -= 1) {
    overlap.unshift(units[index])
    if (unitsTokenCount(overlap) >= overlapTokens) break
  }
  return overlap
}

function makeChunk(units: TextUnit[]): Omit<RagChunk, 'id'> {
  const text = units.map((unit) => unit.text).join('\n\n')
  const pages = units.map((unit) => unit.page)
  const sections = Array.from(
    new Set(
      units.map((unit) => unit.sectionTitle).filter((value): value is string => Boolean(value)),
    ),
  )

  return {
    text,
    pageStart: Math.min(...pages),
    pageEnd: Math.max(...pages),
    sections,
    tokenCount: countTokens(text),
  }
}

export function createChunks(
  pages: SourcePage[],
  options: { maxTokens?: number; overlapTokens?: number } = {},
): RagChunk[] {
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS
  const overlapTokens = options.overlapTokens ?? DEFAULT_OVERLAP_TOKENS

  if (!Number.isInteger(maxTokens) || maxTokens < 1) {
    throw new Error('maxTokens must be a positive integer.')
  }
  if (!Number.isInteger(overlapTokens) || overlapTokens < 0 || overlapTokens >= maxTokens) {
    throw new Error('overlapTokens must be a non-negative integer smaller than maxTokens.')
  }

  const sourceUnits = pagesToUnits(pages).flatMap((unit) =>
    splitOversizedUnit(unit, maxTokens, overlapTokens),
  )
  if (sourceUnits.length === 0) throw new Error('The PDF did not contain extractable text.')

  const chunks: Array<Omit<RagChunk, 'id'>> = []
  let current: TextUnit[] = []

  const flush = () => {
    if (current.length === 0) return
    chunks.push(makeChunk(current))
  }

  for (const unit of sourceUnits) {
    const candidate = [...current, unit]
    if (current.length > 0 && unitsTokenCount(candidate) > maxTokens) {
      flush()
      current = overlapTokens > 0 ? overlapUnits(current, overlapTokens) : []
      while (current.length > 0 && unitsTokenCount([...current, unit]) > maxTokens) {
        current.shift()
      }
    }
    current.push(unit)
  }
  flush()

  return chunks.map((chunk, index) => ({
    id: `chunk-${String(index + 1).padStart(4, '0')}-${sha256(
      `${chunk.pageStart}:${chunk.pageEnd}:${chunk.text}`,
    ).slice(0, 12)}`,
    ...chunk,
  }))
}

export function embeddingInput(chunk: RagChunk): string {
  const missingSections = chunk.sections.filter((section) => !chunk.text.includes(section))
  return missingSections.length > 0 ? `${missingSections.join('\n')}\n\n${chunk.text}` : chunk.text
}

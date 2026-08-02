import { readFile } from 'node:fs/promises'

import {
  countTokens,
  createChunks,
  embeddingInput,
  normalizePageText,
} from '../../scripts/lib/rag-chunks'
import { describe, expect, it } from 'vitest'

describe('RAG document chunking', () => {
  it('normalizes PDF artifacts while preserving readable structure', () => {
    expect(normalizePageText('Hello\u0000  \r\nworld\u00ad\r\n-- 1 of 2 --')).toBe('Hello\nworld')
  })

  it('creates deterministic, page-aware chunks within the token limit', () => {
    const paragraph = Array.from(
      { length: 80 },
      (_, index) => `Sentence ${index} has useful text.`,
    ).join(' ')
    const pages = [
      { page: 1, text: `Finding a Family Doctor\n${paragraph}` },
      { page: 2, text: `Walk-in Clinics\n${paragraph}` },
    ]

    const first = createChunks(pages, { maxTokens: 100, overlapTokens: 20 })
    const second = createChunks(pages, { maxTokens: 100, overlapTokens: 20 })

    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(2)
    expect(first.every((chunk) => chunk.text && chunk.tokenCount <= 100)).toBe(true)
    expect(first[0].pageStart).toBe(1)
    expect(first.at(-1)?.pageEnd).toBe(2)
    expect(first[0].sections).toContain('Finding a Family Doctor')
  })

  it('splits a single oversized unit and retains overlap', () => {
    const text = Array.from({ length: 300 }, (_, index) => `word${index}`).join(' ')
    const chunks = createChunks([{ page: 7, text }], { maxTokens: 80, overlapTokens: 15 })

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((chunk) => chunk.pageStart === 7 && chunk.pageEnd === 7)).toBe(true)
    expect(chunks.every((chunk) => countTokens(chunk.text) <= 80)).toBe(true)
    const firstTail = new Set(chunks[0].text.split(/\s+/).slice(-12))
    const repeatedWords = chunks[1].text
      .split(/\s+/)
      .slice(0, 12)
      .filter((word) => firstTail.has(word))
    expect(repeatedWords.length).toBeGreaterThan(3)
  })

  it('does not merge a completed list item into the following paragraph', () => {
    const [chunk] = createChunks(
      [{ page: 1, text: '. First complete item.\nA separate explanatory paragraph follows.' }],
      { maxTokens: 100, overlapTokens: 0 },
    )

    expect(chunk.text).toBe('- First complete item.\n\nA separate explanatory paragraph follows.')
  })

  it('adds a missing section title to the text used for embedding', () => {
    const chunk = {
      id: 'chunk-0001-test',
      text: 'Appointments are available during clinic hours.',
      pageStart: 2,
      pageEnd: 2,
      sections: ['Walk-in Clinics'],
      tokenCount: 8,
    }

    expect(embeddingInput(chunk)).toBe(`Walk-in Clinics\n\n${chunk.text}`)
  })

  it('rejects invalid chunk sizes and empty documents', () => {
    expect(() => createChunks([], { maxTokens: 100, overlapTokens: 20 })).toThrow(
      'extractable text',
    )
    expect(() =>
      createChunks([{ page: 1, text: 'Hello' }], { maxTokens: 100, overlapTokens: 100 }),
    ).toThrow('overlapTokens')
  })

  it('ships a complete embedded chunk file for the HealthBridge PDF', async () => {
    const document = JSON.parse(
      await readFile('src/data/rag/healthbridge-content.chunks.json', 'utf8'),
    ) as {
      source: { pageCount: number }
      embedding: { dimensions: number } | null
      chunks: Array<{
        text: string
        tokenCount: number
        pageStart: number
        pageEnd: number
        embedding?: number[]
      }>
    }

    expect(document.source.pageCount).toBe(66)
    expect(document.embedding?.dimensions).toBeGreaterThan(0)
    expect(document.chunks.length).toBeGreaterThan(0)
    expect(document.chunks.every((chunk) => chunk.text && chunk.tokenCount <= 800)).toBe(true)
    expect(
      document.chunks.every((chunk) => chunk.embedding?.length === document.embedding?.dimensions),
    ).toBe(true)
    expect(document.chunks[0].pageStart).toBe(1)
    expect(document.chunks.at(-1)?.pageEnd).toBe(66)
  })
})

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { openai } from '@ai-sdk/openai'
import { cosineSimilarity, embed } from 'ai'

import { getMessageText } from './messages'
import type { HealthBridgeChatMessage } from './types'

const DEFAULT_INDEX_PATH = path.join(
  process.cwd(),
  'src',
  'data',
  'rag',
  'healthbridge-content.chunks.json',
)

export const RAG_TOP_K = 4
export const RAG_MIN_SIMILARITY = 0.25

type StoredChunk = {
  id: string
  text: string
  pageStart: number
  pageEnd: number
  sections: string[]
  tokenCount: number
  embedding: number[]
}

export type RagIndex = {
  schemaVersion: 1
  source: {
    filename: string
    path: string
    sha256: string
    pageCount: number
  }
  embedding: {
    model: string
    dimensions: number
  }
  chunks: StoredChunk[]
}

export type RetrievedChunk = Omit<StoredChunk, 'embedding'> & {
  score: number
}

export type RagRetrieval = {
  status: 'used' | 'no_match'
  source: RagIndex['source']
  embeddingModel: string
  chunks: RetrievedChunk[]
}

const indexCache = new Map<string, Promise<RagIndex>>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0
}

function isFiniteVector(value: unknown, dimensions: number): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === dimensions &&
    value.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate))
  )
}

export function validateRagIndex(value: unknown): RagIndex {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new Error('The HealthBridge RAG index has an unsupported schema.')
  }

  const source = value.source
  const embedding = value.embedding
  const chunks = value.chunks
  if (
    !isRecord(source) ||
    typeof source.filename !== 'string' ||
    typeof source.path !== 'string' ||
    typeof source.sha256 !== 'string' ||
    !/^[a-f\d]{64}$/i.test(source.sha256) ||
    !isPositiveInteger(source.pageCount) ||
    !isRecord(embedding) ||
    typeof embedding.model !== 'string' ||
    !embedding.model.trim() ||
    !isPositiveInteger(embedding.dimensions) ||
    !Array.isArray(chunks) ||
    chunks.length === 0
  ) {
    throw new Error('The HealthBridge RAG index metadata is invalid.')
  }
  const dimensions = embedding.dimensions

  const parsedChunks: StoredChunk[] = chunks.map((chunk, index) => {
    if (
      !isRecord(chunk) ||
      typeof chunk.id !== 'string' ||
      typeof chunk.text !== 'string' ||
      !chunk.text.trim() ||
      !isPositiveInteger(chunk.pageStart) ||
      !isPositiveInteger(chunk.pageEnd) ||
      chunk.pageEnd < chunk.pageStart ||
      !Array.isArray(chunk.sections) ||
      !chunk.sections.every((section) => typeof section === 'string') ||
      !isPositiveInteger(chunk.tokenCount) ||
      !isFiniteVector(chunk.embedding, dimensions)
    ) {
      throw new Error(`HealthBridge RAG chunk ${index + 1} is invalid.`)
    }

    return {
      id: chunk.id,
      text: chunk.text,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      sections: chunk.sections,
      tokenCount: chunk.tokenCount,
      embedding: chunk.embedding,
    }
  })

  return {
    schemaVersion: 1,
    source: {
      filename: source.filename,
      path: source.path,
      sha256: source.sha256,
      pageCount: source.pageCount,
    },
    embedding: { model: embedding.model, dimensions },
    chunks: parsedChunks,
  }
}

export function loadRagIndex(indexPath = DEFAULT_INDEX_PATH): Promise<RagIndex> {
  const resolvedPath = path.resolve(indexPath)
  const cached = indexCache.get(resolvedPath)
  if (cached) return cached

  const pending = readFile(resolvedPath, 'utf8')
    .then((contents) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(contents)
      } catch {
        throw new Error('The HealthBridge RAG index is not valid JSON.')
      }
      return validateRagIndex(parsed)
    })
    .catch((error: unknown) => {
      indexCache.delete(resolvedPath)
      throw error
    })
  indexCache.set(resolvedPath, pending)
  return pending
}

export function buildRetrievalQuery(messages: HealthBridgeChatMessage[]): string {
  return messages
    .filter((message) => message.role === 'user')
    .slice(-2)
    .map((message) => getMessageText(message).trim())
    .filter(Boolean)
    .join('\n\n')
}

export function rankRagChunks(
  index: RagIndex,
  queryEmbedding: number[],
  options: { minSimilarity?: number; topK?: number } = {},
): RetrievedChunk[] {
  if (!isFiniteVector(queryEmbedding, index.embedding.dimensions)) {
    throw new Error('The query embedding dimensions do not match the HealthBridge RAG index.')
  }

  const minSimilarity = options.minSimilarity ?? RAG_MIN_SIMILARITY
  const topK = options.topK ?? RAG_TOP_K
  return index.chunks
    .map(({ embedding, ...chunk }) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, embedding),
    }))
    .filter((chunk) => chunk.score >= minSimilarity)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
}

export async function retrieveHealthBridgeContext({
  abortSignal,
  query,
  userIdentifier,
}: {
  abortSignal?: AbortSignal
  query: string
  userIdentifier?: string
}): Promise<RagRetrieval> {
  if (!query.trim()) throw new Error('A retrieval query is required.')

  const index = await loadRagIndex()
  const result = await embed({
    model: openai.embedding(index.embedding.model),
    value: query,
    abortSignal,
    maxRetries: 2,
    providerOptions: userIdentifier ? { openai: { user: userIdentifier } } : undefined,
  })
  const chunks = rankRagChunks(index, result.embedding)

  return {
    status: chunks.length > 0 ? 'used' : 'no_match',
    source: index.source,
    embeddingModel: index.embedding.model,
    chunks,
  }
}

export function pageCitation(chunk: Pick<RetrievedChunk, 'pageStart' | 'pageEnd'>): string {
  return chunk.pageStart === chunk.pageEnd
    ? `[HealthBridge Content, p. ${chunk.pageStart}]`
    : `[HealthBridge Content, pp. ${chunk.pageStart}-${chunk.pageEnd}]`
}

export function formatRagExcerpts(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk) => {
      const sections = chunk.sections.length > 0 ? `\nSections: ${chunk.sections.join(' > ')}` : ''
      return `Citation: ${pageCitation(chunk)}\nChunk: ${chunk.id}${sections}\n${chunk.text}`
    })
    .join('\n\n---\n\n')
}

export function ragAuditMetadata(
  retrieval: RagRetrieval | undefined,
  status: 'used' | 'no_match' | 'unavailable',
) {
  return {
    status,
    sourceHash: retrieval?.source.sha256,
    embeddingModel: retrieval?.embeddingModel,
    chunks: retrieval?.chunks.map((chunk) => ({
      id: chunk.id,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      score: Number(chunk.score.toFixed(4)),
    })),
  }
}

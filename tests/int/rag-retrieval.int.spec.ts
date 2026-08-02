import path from 'node:path'

import {
  buildRetrievalQuery,
  formatRagExcerpts,
  loadRagIndex,
  pageCitation,
  rankRagChunks,
  type RagIndex,
  validateRagIndex,
} from '@/lib/chat/rag'
import { describe, expect, it } from 'vitest'

function testIndex(): RagIndex {
  return {
    schemaVersion: 1,
    source: {
      filename: 'healthbridge.pdf',
      path: 'src/healthbridge.pdf',
      sha256: 'a'.repeat(64),
      pageCount: 4,
    },
    embedding: { model: 'text-embedding-3-small', dimensions: 3 },
    chunks: [
      {
        id: 'family-doctor',
        text: 'How to find a family doctor.',
        pageStart: 1,
        pageEnd: 1,
        sections: ['Family Doctor'],
        tokenCount: 8,
        embedding: [1, 0, 0],
      },
      {
        id: 'urgent-care',
        text: 'Urgent care treats same-day, non-life-threatening problems.',
        pageStart: 2,
        pageEnd: 3,
        sections: ['Urgent Care'],
        tokenCount: 12,
        embedding: [0.9, 0.1, 0],
      },
      {
        id: 'insurance',
        text: 'Insurance coverage varies.',
        pageStart: 4,
        pageEnd: 4,
        sections: ['Insurance'],
        tokenCount: 5,
        embedding: [0, 1, 0],
      },
    ],
  }
}

describe('HealthBridge RAG retrieval', () => {
  it('loads and validates the generated filesystem index', async () => {
    const index = await loadRagIndex()

    expect(index.source.pageCount).toBe(66)
    expect(index.chunks).toHaveLength(37)
    expect(
      index.chunks.every((chunk) => chunk.embedding.length === index.embedding.dimensions),
    ).toBe(true)
  })

  it('rejects malformed metadata and chunk embeddings', () => {
    expect(() => validateRagIndex({ schemaVersion: 2 })).toThrow('unsupported schema')

    const invalid = testIndex()
    invalid.chunks[0].embedding = [1, 0]
    expect(() => validateRagIndex(invalid)).toThrow('chunk 1 is invalid')
  })

  it('reports a missing index file', async () => {
    await expect(
      loadRagIndex(path.join(process.cwd(), 'src', 'data', 'rag', 'missing-index.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('ranks by cosine similarity, applies the threshold, and limits results', () => {
    const ranked = rankRagChunks(testIndex(), [1, 0, 0], {
      minSimilarity: 0.25,
      topK: 2,
    })

    expect(ranked.map((chunk) => chunk.id)).toEqual(['family-doctor', 'urgent-care'])
    expect(ranked).toHaveLength(2)
    expect(ranked[0]).not.toHaveProperty('embedding')
    expect(rankRagChunks(testIndex(), [0, 0, 1], { minSimilarity: 0.25 })).toEqual([])
  })

  it('rejects query vectors with the wrong dimensions', () => {
    expect(() => rankRagChunks(testIndex(), [1, 0])).toThrow('dimensions do not match')
  })

  it('builds retrieval queries from only the latest two user messages', () => {
    const query = buildRetrievalQuery([
      { id: '1', role: 'user', parts: [{ type: 'text', text: 'First question' }] },
      { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'First answer' }] },
      { id: '3', role: 'user', parts: [{ type: 'text', text: 'Second question' }] },
      { id: '4', role: 'user', parts: [{ type: 'text', text: 'Follow-up question' }] },
    ])

    expect(query).toBe('Second question\n\nFollow-up question')
  })

  it('formats exact single-page and page-range citation labels', () => {
    const ranked = rankRagChunks(testIndex(), [1, 0, 0], { topK: 2 })

    expect(pageCitation(ranked[0])).toBe('[HealthBridge Content, p. 1]')
    expect(pageCitation(ranked[1])).toBe('[HealthBridge Content, pp. 2-3]')
    expect(formatRagExcerpts(ranked)).toContain('Citation: [HealthBridge Content, p. 1]')
    expect(formatRagExcerpts(ranked)).not.toContain('embedding')
  })
})

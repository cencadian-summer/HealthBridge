import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createConversation: vi.fn(),
  createStoredMessage: vi.fn(),
  refreshConversationSummary: vi.fn(),
  retrieveHealthBridgeContext: vi.fn(),
  streamText: vi.fn(),
  updateStoredMessage: vi.fn(),
  user: null as { id: string } | null,
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: { responses: (model: string) => ({ model }) },
}))

vi.mock('ai', () => ({
  convertToModelMessages: async (messages: unknown) => messages,
  streamText: mocks.streamText,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: mocks.user } }) },
  }),
}))

vi.mock('@/lib/chat/store', () => ({
  createConversation: mocks.createConversation,
  createStoredMessage: mocks.createStoredMessage,
  findOwnedConversation: vi.fn(),
  getModelContext: vi.fn(async () => [{ role: 'user', content: 'Hello' }]),
  refreshConversationSummary: mocks.refreshConversationSummary,
  updateStoredMessage: mocks.updateStoredMessage,
}))

vi.mock('@/lib/chat/rag', () => ({
  buildRetrievalQuery: (messages: Array<{ role: string; parts: Array<{ text?: string }> }>) =>
    messages
      .filter((message) => message.role === 'user')
      .slice(-2)
      .map((message) => message.parts.map((part) => part.text || '').join(''))
      .join('\n\n'),
  formatRagExcerpts: (chunks: Array<{ id: string; text: string }>) =>
    chunks.map((chunk) => `Citation: [HealthBridge Content, p. 2]\n${chunk.text}`).join('\n'),
  ragAuditMetadata: (retrieval: { chunks?: unknown[] } | undefined, status: string) => ({
    status,
    chunks: retrieval?.chunks ?? [],
  }),
  retrieveHealthBridgeContext: mocks.retrieveHealthBridgeContext,
}))

const originalOpenAIKey = process.env.OPENAI_API_KEY
const originalPayloadSecret = process.env.PAYLOAD_SECRET

describe('chat streaming route', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.PAYLOAD_SECRET = 'test-secret'
  })

  afterAll(() => {
    if (originalOpenAIKey) process.env.OPENAI_API_KEY = originalOpenAIKey
    else delete process.env.OPENAI_API_KEY
    if (originalPayloadSecret) process.env.PAYLOAD_SECRET = originalPayloadSecret
    else Reflect.deleteProperty(process.env, 'PAYLOAD_SECRET')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = null
    mocks.createConversation.mockResolvedValue({ id: '507f1f77bcf86cd799439011' })
    mocks.createStoredMessage
      .mockResolvedValueOnce({ id: '507f1f77bcf86cd799439012' })
      .mockResolvedValueOnce({ id: '507f1f77bcf86cd799439013' })
    mocks.retrieveHealthBridgeContext.mockResolvedValue({
      status: 'used',
      source: {
        filename: 'healthbridge content.pdf',
        path: 'src/healthbridge content.pdf',
        sha256: 'a'.repeat(64),
        pageCount: 66,
      },
      embeddingModel: 'text-embedding-3-small',
      chunks: [
        {
          id: 'chunk-1',
          text: 'Urgent care is for same-day, non-life-threatening problems.',
          pageStart: 2,
          pageEnd: 2,
          sections: ['Urgent Care'],
          tokenCount: 12,
          score: 0.8,
        },
      ],
    })
    mocks.streamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('streamed response'),
    })
  })

  it('streams a validated guest request without writing chat records', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          id: 'guest-session',
          trigger: 'submit-message',
          messages: [{ id: 'message-1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] }],
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('streamed response')
    expect(mocks.createStoredMessage).not.toHaveBeenCalled()
    expect(mocks.streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('<healthbridge_reference>'),
        providerOptions: {
          openai: expect.objectContaining({ store: false }),
        },
      }),
    )
  })

  it('uses the latest two user turns as retrieval context', async () => {
    const { POST } = await import('@/app/api/chat/route')
    await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          id: 'guest-session',
          messages: [
            { id: '1', role: 'user', parts: [{ type: 'text', text: 'Old question' }] },
            { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'Old answer' }] },
            { id: '3', role: 'user', parts: [{ type: 'text', text: 'Urgent care?' }] },
            { id: '4', role: 'assistant', parts: [{ type: 'text', text: 'Some answer' }] },
            { id: '5', role: 'user', parts: [{ type: 'text', text: 'What about emergencies?' }] },
          ],
        }),
      }),
    )

    expect(mocks.retrieveHealthBridgeContext).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'Urgent care?\n\nWhat about emergencies?' }),
    )
    expect(mocks.streamText.mock.calls.at(-1)?.[0].system).toContain(
      'Citation: [HealthBridge Content, p. 2]',
    )
  })

  it('falls back safely when retrieval is unavailable', async () => {
    mocks.retrieveHealthBridgeContext.mockRejectedValueOnce(new Error('embedding unavailable'))
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { id: 'message-1', role: 'user', parts: [{ type: 'text', text: 'Urgent care?' }] },
          ],
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.streamText.mock.calls.at(-1)?.[0].system).toContain(
      'Retrieval is temporarily unavailable',
    )
    expect(log).toHaveBeenCalledWith(
      'HealthBridge RAG retrieval failed.',
      expect.objectContaining({ errorName: 'Error' }),
    )
    log.mockRestore()
  })

  it('accepts follow-up requests containing the AI SDK assistant step marker', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          id: 'guest-session',
          trigger: 'submit-message',
          messages: [
            { id: 'message-1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
            {
              id: 'message-2',
              role: 'assistant',
              parts: [{ type: 'step-start' }, { type: 'text', text: 'Hi there.' }],
            },
            { id: 'message-3', role: 'user', parts: [{ type: 'text', text: 'Why?' }] },
          ],
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.streamText).toHaveBeenCalled()
  })

  it('rejects oversized guest messages before calling OpenAI', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { id: 'message-1', role: 'user', parts: [{ type: 'text', text: 'x'.repeat(4_001) }] },
          ],
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(mocks.streamText).not.toHaveBeenCalled()
  })

  it('persists an authenticated completion exactly once', async () => {
    mocks.user = { id: 'authenticated-user' }
    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          id: 'authenticated-session',
          trigger: 'submit-message',
          messages: [{ id: 'message-1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] }],
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.createStoredMessage).toHaveBeenCalledTimes(2)
    const options = mocks.streamText.mock.calls[0]?.[0]
    options.onChunk({ chunk: { type: 'text-delta', text: 'Welcome' } })
    const endEvent = {
      text: 'Welcome',
      finishReason: 'stop',
      response: { id: 'response-1' },
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      providerMetadata: {},
    }
    await options.onEnd(endEvent)
    await options.onEnd(endEvent)

    expect(mocks.updateStoredMessage).toHaveBeenCalledTimes(1)
    expect(mocks.updateStoredMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Welcome',
        providerMetadata: expect.objectContaining({
          rag: expect.objectContaining({ status: 'used' }),
        }),
        state: 'completed',
      }),
    )
  })

  it('returns a safe unavailable response when OpenAI is not configured', async () => {
    const { POST } = await import('@/app/api/chat/route')
    delete process.env.OPENAI_API_KEY
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    process.env.OPENAI_API_KEY = 'test-key'

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: 'Chat is not configured yet. Please try again later.',
    })
  })
})

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createConversation: vi.fn(),
  createStoredMessage: vi.fn(),
  refreshConversationSummary: vi.fn(),
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
    else delete process.env.PAYLOAD_SECRET
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = null
    mocks.createConversation.mockResolvedValue({ id: '507f1f77bcf86cd799439011' })
    mocks.createStoredMessage
      .mockResolvedValueOnce({ id: '507f1f77bcf86cd799439012' })
      .mockResolvedValueOnce({ id: '507f1f77bcf86cd799439013' })
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
        providerOptions: {
          openai: expect.objectContaining({ store: false }),
        },
      }),
    )
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
      expect.objectContaining({ content: 'Welcome', state: 'completed' }),
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

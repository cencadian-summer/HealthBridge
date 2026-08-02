import { randomUUID } from 'node:crypto'

import config from '@/payload.config'
import { MAX_CONTEXT_MESSAGES, parseClientMessages } from '@/lib/chat/messages'
import {
  createConversation,
  createStoredMessage,
  deleteOwnedConversation,
  findOwnedConversation,
  getConversationMessages,
  listOwnedConversations,
  refreshConversationSummary,
  renameOwnedConversation,
} from '@/lib/chat/store'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload

describe('chat persistence and validation', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('rejects malformed, non-text, oversized, and excessive client history', () => {
    expect(() => parseClientMessages([])).toThrow()
    expect(() =>
      parseClientMessages([{ id: '1', role: 'system', parts: [{ type: 'text', text: 'bad' }] }]),
    ).toThrow()
    expect(() =>
      parseClientMessages([{ id: '1', role: 'user', parts: [{ type: 'file', url: 'x' }] }]),
    ).toThrow('Only text chat is supported.')
    expect(() =>
      parseClientMessages([
        { id: '1', role: 'user', parts: [{ type: 'text', text: 'x'.repeat(4_001) }] },
      ]),
    ).toThrow()
    expect(() =>
      parseClientMessages(
        Array.from({ length: MAX_CONTEXT_MESSAGES + 1 }, (_, index) => ({
          id: String(index),
          role: index % 2 ? 'assistant' : 'user',
          parts: [{ type: 'text', text: 'hello' }],
        })),
      ),
    ).toThrow()
  })

  it('accepts the AI SDK step marker while sanitizing assistant history to text', () => {
    expect(
      parseClientMessages([
        { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
        {
          id: '2',
          role: 'assistant',
          parts: [{ type: 'step-start' }, { type: 'text', text: 'How can I help?' }],
        },
        { id: '3', role: 'user', parts: [{ type: 'text', text: 'Why?' }] },
      ]),
    ).toEqual([
      { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
      { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'How can I help?' }] },
      { id: '3', role: 'user', parts: [{ type: 'text', text: 'Why?' }] },
    ])
  })

  it('stores, scopes, renames, lists, and cascade-deletes owned conversations', async () => {
    const ownerId = randomUUID()
    const otherOwnerId = randomUUID()
    const conversation = await createConversation(ownerId, 'How do I find a family doctor?')

    try {
      await createStoredMessage({
        content: 'How do I find a family doctor?',
        conversationId: conversation.id,
        ownerId,
        role: 'user',
        state: 'completed',
      })
      await createStoredMessage({
        content: 'You can begin by checking provincial resources.',
        conversationId: conversation.id,
        ownerId,
        role: 'assistant',
        state: 'completed',
      })
      await refreshConversationSummary(conversation.id, ownerId)

      expect(await findOwnedConversation(ownerId, conversation.id)).not.toBeNull()
      expect(await findOwnedConversation(otherOwnerId, conversation.id)).toBeNull()
      expect(await renameOwnedConversation(otherOwnerId, conversation.id, 'Not allowed')).toBeNull()
      expect(await deleteOwnedConversation(otherOwnerId, conversation.id)).toBe(false)

      const renamed = await renameOwnedConversation(ownerId, conversation.id, 'Finding a doctor')
      expect(renamed?.title).toBe('Finding a doctor')

      const messages = await getConversationMessages(conversation.id, ownerId)
      expect(messages).toHaveLength(2)
      expect(messages.map((message) => message.role)).toEqual(['user', 'assistant'])

      const history = await listOwnedConversations(ownerId)
      expect(history.find((item) => item.id === conversation.id)).toMatchObject({
        messageCount: 2,
        title: 'Finding a doctor',
      })

      expect(await deleteOwnedConversation(ownerId, conversation.id)).toBe(true)
      const remaining = await payload.count({
        collection: 'chat-messages',
        where: { conversation: { equals: conversation.id } },
        overrideAccess: true,
      })
      expect(remaining.totalDocs).toBe(0)
    } finally {
      const existing = await findOwnedConversation(ownerId, conversation.id)
      if (existing) await deleteOwnedConversation(ownerId, conversation.id)
    }
  }, 20_000)

  it('keeps transcript collections inaccessible through normal Payload access', async () => {
    await expect(
      payload.find({ collection: 'chat-conversations', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.find({ collection: 'chat-messages', overrideAccess: false }),
    ).rejects.toThrow()
  })
})

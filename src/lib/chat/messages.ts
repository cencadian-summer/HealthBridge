import type { HealthBridgeChatMessage } from './types'

export const MAX_CONTEXT_MESSAGES = 20
export const MAX_USER_MESSAGE_LENGTH = 4_000
const MAX_ASSISTANT_MESSAGE_LENGTH = 16_000

export function getMessageText(message: Pick<HealthBridgeChatMessage, 'parts'>): string {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
}

export function parseClientMessages(value: unknown): HealthBridgeChatMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CONTEXT_MESSAGES) {
    throw new Error('A valid chat history is required.')
  }

  return value.map((candidate, index) => {
    if (!candidate || typeof candidate !== 'object') {
      throw new Error('A chat message is malformed.')
    }

    const record = candidate as Record<string, unknown>
    const role = record.role
    const parts = record.parts

    if ((role !== 'user' && role !== 'assistant') || !Array.isArray(parts) || parts.length === 0) {
      throw new Error('A chat message is malformed.')
    }

    const textParts = parts.flatMap((part) => {
      if (!part || typeof part !== 'object') throw new Error('Only text chat is supported.')
      const partRecord = part as Record<string, unknown>

      // AI SDK adds this structural marker to assistant UI messages at the
      // beginning of each model step. It has no model-visible content, so it
      // is safe to discard when rebuilding trusted context.
      if (role === 'assistant' && partRecord.type === 'step-start') return []

      if (partRecord.type !== 'text' || typeof partRecord.text !== 'string') {
        throw new Error('Only text chat is supported.')
      }
      return [{ type: 'text' as const, text: partRecord.text }]
    })

    const text = textParts.map((part) => part.text).join('')
    const maxLength = role === 'user' ? MAX_USER_MESSAGE_LENGTH : MAX_ASSISTANT_MESSAGE_LENGTH
    if (!text.trim() || text.length > maxLength) {
      throw new Error(
        role === 'user'
          ? `Messages must be between 1 and ${MAX_USER_MESSAGE_LENGTH.toLocaleString()} characters.`
          : 'A chat message is malformed.',
      )
    }

    return {
      id: typeof record.id === 'string' && record.id.length <= 100 ? record.id : `message-${index}`,
      role,
      parts: textParts,
    }
  })
}

export function toUIMessage({
  content,
  createdAt,
  id,
  role,
  state = 'completed',
}: {
  content: string
  createdAt?: string
  id: string
  role: 'user' | 'assistant'
  state?: 'pending' | 'completed' | 'interrupted' | 'error'
}): HealthBridgeChatMessage {
  return {
    id,
    role,
    metadata: { createdAt, persistedMessageId: id, state },
    parts: [{ type: 'text', text: content }],
  }
}

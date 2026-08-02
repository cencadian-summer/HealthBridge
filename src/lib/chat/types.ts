import type { UIMessage } from 'ai'

export type ChatMessageMetadata = {
  conversationId?: string
  createdAt?: string
  persistedMessageId?: string
  state?: 'pending' | 'completed' | 'interrupted' | 'error'
}

export type HealthBridgeChatMessage = UIMessage<ChatMessageMetadata>

export type ChatRequestBody = {
  conversationId?: string
  messages?: unknown
  trigger?: 'submit-message' | 'regenerate-message'
}

export type ChatHistoryItem = {
  id: string
  lastMessageAt: string
  messageCount: number
  preview: string
  title: string
}

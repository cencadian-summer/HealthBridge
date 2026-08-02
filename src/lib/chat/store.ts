import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'

import type { ChatConversation, ChatMessage } from '@/payload-types'
import type { ChatHistoryItem, HealthBridgeChatMessage } from './types'
import { MAX_CONTEXT_MESSAGES, toUIMessage } from './messages'

const trusted = { overrideAccess: true as const }

function relationshipID(value: ChatMessage['conversation']) {
  return typeof value === 'string' ? value : value.id
}

function preview(content: string) {
  return content.replace(/\s+/g, ' ').trim().slice(0, 240)
}

export function createConversationTitle(content: string) {
  const compact = content.replace(/\s+/g, ' ').trim()
  return compact.length > 60 ? `${compact.slice(0, 57).trimEnd()}…` : compact || 'New chat'
}

export async function findOwnedConversation(ownerId: string, id: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'chat-conversations',
    where: { and: [{ id: { equals: id } }, { ownerId: { equals: ownerId } }] },
    depth: 0,
    limit: 1,
    ...trusted,
  })
  return result.docs[0] ?? null
}

export async function createConversation(ownerId: string, firstMessage: string) {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'chat-conversations',
    data: {
      ownerId,
      title: createConversationTitle(firstMessage),
      status: 'active',
      messageCount: 0,
    },
    ...trusted,
  })
}

export async function createStoredMessage({
  content,
  conversationId,
  ownerId,
  role,
  state,
}: {
  content: string
  conversationId: string
  ownerId: string
  role: 'user' | 'assistant'
  state: ChatMessage['state']
}) {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'chat-messages',
    data: { conversation: conversationId, content, ownerId, role, state },
    ...trusted,
  })
}

export async function updateStoredMessage({
  content,
  id,
  providerMetadata,
  providerResponseId,
  state,
}: {
  content: string
  id: string
  providerMetadata?: Record<string, unknown>
  providerResponseId?: string
  state: ChatMessage['state']
}) {
  const payload = await getPayload({ config })
  return payload.update({
    collection: 'chat-messages',
    id,
    data: { content, providerMetadata, providerResponseId, state },
    ...trusted,
  })
}

export async function refreshConversationSummary(conversationId: string, ownerId: string) {
  const payload = await getPayload({ config })
  const where: Where = {
    and: [
      { conversation: { equals: conversationId } },
      { ownerId: { equals: ownerId } },
      { state: { equals: 'completed' } },
    ],
  }
  const [count, latest] = await Promise.all([
    payload.count({ collection: 'chat-messages', where, ...trusted }),
    payload.find({
      collection: 'chat-messages',
      where,
      sort: '-createdAt',
      depth: 0,
      limit: 1,
      ...trusted,
    }),
  ])
  const last = latest.docs[0]
  await payload.update({
    collection: 'chat-conversations',
    id: conversationId,
    data: {
      messageCount: count.totalDocs,
      lastMessageAt: last?.createdAt,
      lastMessagePreview: last ? preview(last.content) : '',
    },
    ...trusted,
  })
}

export async function getConversationMessages(
  conversationId: string,
  ownerId: string,
  limit = 200,
): Promise<HealthBridgeChatMessage[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'chat-messages',
    where: {
      and: [
        { conversation: { equals: conversationId } },
        { ownerId: { equals: ownerId } },
        { state: { equals: 'completed' } },
      ],
    },
    sort: '-createdAt',
    depth: 0,
    limit,
    ...trusted,
  })
  return result.docs.reverse().map((message) =>
    toUIMessage({
      content: message.content,
      createdAt: message.createdAt,
      id: message.id,
      role: message.role,
      state: message.state,
    }),
  )
}

export async function getModelContext(conversationId: string, ownerId: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'chat-messages',
    where: {
      and: [
        { conversation: { equals: conversationId } },
        { ownerId: { equals: ownerId } },
        { state: { equals: 'completed' } },
      ],
    },
    sort: '-createdAt',
    depth: 0,
    limit: MAX_CONTEXT_MESSAGES,
    ...trusted,
  })
  return result.docs.reverse().map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

export async function listOwnedConversations(ownerId: string): Promise<ChatHistoryItem[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'chat-conversations',
    where: { ownerId: { equals: ownerId } },
    sort: '-lastMessageAt',
    depth: 0,
    limit: 100,
    ...trusted,
  })
  return result.docs.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    preview: conversation.lastMessagePreview ?? '',
    messageCount: conversation.messageCount,
    lastMessageAt: conversation.lastMessageAt ?? conversation.updatedAt,
  }))
}

export async function renameOwnedConversation(ownerId: string, id: string, title: string) {
  const conversation = await findOwnedConversation(ownerId, id)
  if (!conversation) return null
  const payload = await getPayload({ config })
  return payload.update({
    collection: 'chat-conversations',
    id: conversation.id,
    data: { title },
    ...trusted,
  })
}

export async function deleteOwnedConversation(ownerId: string, id: string) {
  const conversation = await findOwnedConversation(ownerId, id)
  if (!conversation) return false
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'chat-conversations', id: conversation.id, ...trusted })
  return true
}

export function conversationID(message: ChatMessage) {
  return relationshipID(message.conversation)
}

export type OwnedConversation = ChatConversation

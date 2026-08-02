import { createHash } from 'node:crypto'

import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText } from 'ai'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import { getMessageText, parseClientMessages } from '@/lib/chat/messages'
import {
  createConversation,
  createStoredMessage,
  findOwnedConversation,
  getModelContext,
  refreshConversationSummary,
  updateStoredMessage,
} from '@/lib/chat/store'
import type { ChatRequestBody, HealthBridgeChatMessage } from '@/lib/chat/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are the HealthBridge AI assistant. Help people navigate the Canadian health system and understand general health information.

Rules:
- Reply in the language used by the user unless they ask for another language.
- Be clear, calm, concise, and practical.
- You are not a healthcare professional. Do not diagnose conditions, prescribe treatments, or claim certainty about a person's symptoms.
- Encourage users to contact an appropriate licensed healthcare professional when personal medical advice is needed.
- If the user describes an emergency or immediate danger, tell them to call 911 now. Do not delay that instruction with a long explanation.
- Explain that your answers may be inaccurate and should not replace professional care when that caveat is relevant.
- You do not have access to HealthBridge website content, private records, live service directories, or current local availability. Never imply otherwise.
- Do not invent phone numbers, addresses, eligibility rules, wait times, or service availability.
- Do not offer web search, citations, file analysis, or actions; those capabilities are not available in this version.`

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

function isMongoID(value: string) {
  return /^[a-f\d]{24}$/i.test(value)
}

async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

function safetyIdentifier(user: User | null, chatId: string) {
  const secret = process.env.PAYLOAD_SECRET!
  const subject = user ? `user:${user.id}` : `guest:${chatId}`
  return createHash('sha256').update(`${secret}:${subject}`).digest('hex')
}

function serializableMetadata(value: unknown): Record<string, unknown> | undefined {
  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
  } catch {
    return undefined
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY || !process.env.PAYLOAD_SECRET) {
    return jsonError('Chat is not configured yet. Please try again later.', 503)
  }

  let body: ChatRequestBody & { id?: unknown }
  try {
    body = (await request.json()) as ChatRequestBody & { id?: unknown }
  } catch {
    return jsonError('The chat request is malformed.', 400)
  }

  let clientMessages: HealthBridgeChatMessage[]
  try {
    clientMessages = parseClientMessages(body.messages)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'The chat request is malformed.', 400)
  }

  const trigger = body.trigger === 'regenerate-message' ? body.trigger : 'submit-message'
  const user = await getAuthenticatedUser()
  const requestedConversationId =
    typeof body.conversationId === 'string' ? body.conversationId : undefined
  const chatId = typeof body.id === 'string' && body.id.length <= 100 ? body.id : 'anonymous'

  let conversationId: string | undefined
  let assistantMessageId: string | undefined
  let modelMessages

  if (user) {
    if (requestedConversationId && !isMongoID(requestedConversationId)) {
      return jsonError('Conversation not found.', 404)
    }

    let conversation = requestedConversationId
      ? await findOwnedConversation(user.id, requestedConversationId)
      : null

    if (requestedConversationId && !conversation) return jsonError('Conversation not found.', 404)

    if (trigger === 'submit-message') {
      const latestUserMessage = [...clientMessages]
        .reverse()
        .find((message) => message.role === 'user')
      if (!latestUserMessage || clientMessages.at(-1)?.role !== 'user') {
        return jsonError('A new user message is required.', 400)
      }
      const content = getMessageText(latestUserMessage).trim()

      if (!conversation) conversation = await createConversation(user.id, content)
      conversationId = conversation.id
      await createStoredMessage({
        content,
        conversationId,
        ownerId: user.id,
        role: 'user',
        state: 'completed',
      })
      await refreshConversationSummary(conversationId, user.id)
    } else {
      if (!conversation) return jsonError('Conversation not found.', 404)
      conversationId = conversation.id
    }

    const assistantMessage = await createStoredMessage({
      content: '…',
      conversationId,
      ownerId: user.id,
      role: 'assistant',
      state: 'pending',
    })
    assistantMessageId = assistantMessage.id
    modelMessages = await getModelContext(conversationId, user.id)
  } else {
    const guestMessages =
      trigger === 'regenerate-message' && clientMessages.at(-1)?.role === 'assistant'
        ? clientMessages.slice(0, -1)
        : clientMessages
    if (guestMessages.at(-1)?.role !== 'user') {
      return jsonError('A user message is required.', 400)
    }
    modelMessages = await convertToModelMessages(guestMessages)
  }

  let partialText = ''
  let finalized = false

  const finalizeStoredAssistant = async ({
    content,
    metadata,
    providerResponseId,
    state,
  }: {
    content: string
    metadata?: Record<string, unknown>
    providerResponseId?: string
    state: 'completed' | 'interrupted' | 'error'
  }) => {
    if (finalized || !user || !conversationId || !assistantMessageId) return
    finalized = true
    await updateStoredMessage({
      id: assistantMessageId,
      content: content.trim() || (state === 'error' ? 'Response failed.' : 'Response interrupted.'),
      providerMetadata: metadata,
      providerResponseId,
      state,
    })
    await refreshConversationSummary(conversationId, user.id)
  }

  try {
    const result = streamText({
      model: openai.responses(process.env.OPENAI_MODEL || 'gpt-5.6-luna'),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      abortSignal: request.signal,
      maxOutputTokens: 1_200,
      providerOptions: {
        openai: {
          store: false,
          safetyIdentifier: safetyIdentifier(user, chatId),
        },
      },
      onChunk: ({ chunk }) => {
        if (chunk.type === 'text-delta') partialText += chunk.text
      },
      onAbort: async () => {
        await finalizeStoredAssistant({ content: partialText, state: 'interrupted' })
      },
      onError: async () => {
        await finalizeStoredAssistant({ content: partialText, state: 'error' })
      },
      onEnd: async (event) => {
        const completed = event.finishReason !== 'error' && Boolean(event.text.trim())
        await finalizeStoredAssistant({
          content: event.text || partialText,
          state: completed ? 'completed' : 'error',
          providerResponseId: event.response.id,
          metadata: serializableMetadata({
            finishReason: event.finishReason,
            usage: event.usage,
            providerMetadata: event.providerMetadata,
          }),
        })
      },
    })

    return result.toUIMessageStreamResponse<HealthBridgeChatMessage>({
      originalMessages: clientMessages,
      generateMessageId: assistantMessageId ? () => assistantMessageId! : undefined,
      sendReasoning: false,
      sendSources: false,
      messageMetadata: ({ part }) => {
        if (part.type !== 'start' && part.type !== 'finish') return undefined
        return {
          conversationId,
          persistedMessageId: assistantMessageId,
          state: part.type === 'finish' ? 'completed' : 'pending',
        }
      },
      onError: () => 'The assistant could not complete that response. Please try again.',
    })
  } catch {
    await finalizeStoredAssistant({ content: partialText, state: 'error' })
    return jsonError('The assistant could not start a response. Please try again.', 502)
  }
}

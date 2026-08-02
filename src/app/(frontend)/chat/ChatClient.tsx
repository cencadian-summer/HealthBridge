'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  ArrowLeft,
  Bot,
  History,
  LoaderCircle,
  RotateCcw,
  Send,
  Square,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getMessageText, MAX_CONTEXT_MESSAGES, MAX_USER_MESSAGE_LENGTH } from '@/lib/chat/messages'
import type { HealthBridgeChatMessage } from '@/lib/chat/types'

type Props = {
  firstName?: string
  initialConversationId?: string
  initialMessages?: HealthBridgeChatMessage[]
  initialTitle?: string
  isAuthenticated: boolean
}

const suggestions = [
  'How do I find a family doctor?',
  'When should I use a walk-in clinic?',
  'How does a referral to a specialist work?',
]

export function ChatClient({
  firstName,
  initialConversationId,
  initialMessages = [],
  initialTitle,
  isAuthenticated,
}: Props) {
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [sessionId] = useState(() => initialConversationId || crypto.randomUUID())
  const messagesRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<HealthBridgeChatMessage>({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ id, messages, trigger }) => ({
          body: {
            id,
            conversationId,
            trigger,
            messages: messages.slice(-MAX_CONTEXT_MESSAGES),
          },
        }),
      }),
    [conversationId],
  )

  const { error, messages, regenerate, sendMessage, status, stop } =
    useChat<HealthBridgeChatMessage>({
      id: sessionId,
      messages: initialMessages,
      resume: false,
      throttle: 40,
      transport,
      onFinish: ({ message, isAbort, isError }) => {
        const assignedConversationId = message.metadata?.conversationId
        if (isAuthenticated && assignedConversationId && !conversationId) {
          setConversationId(assignedConversationId)
          window.history.replaceState(null, '', `/chat/${assignedConversationId}`)
        }
        if (!isAbort && !isError) setInput('')
      },
    })

  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    const messagePane = messagesRef.current
    if (!messagePane) return

    messagePane.scrollTo({
      behavior: status === 'streaming' ? 'auto' : 'smooth',
      top: messagePane.scrollHeight,
    })
  }, [messages, status])

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault()
    const text = input.trim()
    if (!text || busy || text.length > MAX_USER_MESSAGE_LENGTH) return
    void sendMessage({ text })
    setInput('')
  }

  const startSuggestion = (text: string) => {
    if (busy) return
    void sendMessage({ text })
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#eef9fc] px-3 py-5 sm:px-6 sm:py-8">
      <section className="mx-auto flex min-h-[72vh] max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_24px_80px_-34px_rgba(15,72,90,0.35)]">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={isAuthenticated ? '/dashboard' : '/'}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                aria-label={isAuthenticated ? 'Back to dashboard' : 'Back to homepage'}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-bold text-slate-950">
                  {initialTitle || 'HealthBridge Assistant'}
                </h1>
                <p className="text-xs text-slate-500">AI health-system navigation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard/chats"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">My chats</span>
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => window.location.assign('/chat')}
                className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                New chat
              </button>
            </div>
          </header>

          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center sm:py-14">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                  <Bot className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  {firstName ? `How can I help, ${firstName}?` : 'How can I help today?'}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  Ask general questions about navigating healthcare in Canada. This AI can make
                  mistakes and does not replace professional medical advice.
                </p>
                <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => startSuggestion(suggestion)}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-5">
                {messages.map((message) => {
                  const text = getMessageText(message)
                  const assistant = message.role === 'assistant'
                  return (
                    <article
                      key={message.id}
                      className={`flex gap-3 ${assistant ? '' : 'flex-row-reverse'}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${assistant ? 'bg-teal-100 text-teal-700' : 'bg-slate-800 text-white'}`}
                      >
                        {assistant ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </span>
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${assistant ? 'rounded-tl-sm bg-slate-100 text-slate-800' : 'rounded-tr-sm bg-teal-600 text-white'}`}
                      >
                        {text ||
                          (assistant && busy ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : null)}
                      </div>
                    </article>
                  )
                })}
                {status === 'submitted' ? (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <LoaderCircle className="h-4 w-4 animate-spin text-teal-600" /> HealthBridge is
                    thinking…
                  </div>
                ) : null}
                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                  >
                    <p>The assistant could not complete that response.</p>
                    <button
                      type="button"
                      onClick={() => void regenerate()}
                      className="mt-2 inline-flex items-center gap-2 font-semibold underline"
                    >
                      <RotateCcw className="h-4 w-4" /> Try again
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
              Guest chats are not saved.{' '}
              <Link href="/login" className="font-bold underline">
                Sign in
              </Link>{' '}
              to keep your conversation history.
            </div>
          ) : null}

          <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3 sm:p-5">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submit()
                  }
                }}
                maxLength={MAX_USER_MESSAGE_LENGTH}
                rows={1}
                placeholder="Ask about navigating healthcare in Canada…"
                aria-label="Chat message"
                className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white hover:bg-slate-900"
                  aria-label="Stop generating"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-500">
              If this is an emergency or someone is in immediate danger, call 911.
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

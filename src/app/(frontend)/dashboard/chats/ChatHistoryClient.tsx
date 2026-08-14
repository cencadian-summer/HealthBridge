'use client'

import { CalendarClock, MessageCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import type { ChatHistoryItem } from '@/lib/chat/types'

const chatDateFormatter = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Winnipeg',
})

function formatDate(value: string) {
  return chatDateFormatter.format(new Date(value))
}

export function ChatHistoryClient({ initialChats }: { initialChats: ChatHistoryItem[] }) {
  const [chats, setChats] = useState(initialChats)
  const [editingId, setEditingId] = useState<string>()
  const [title, setTitle] = useState('')
  const [busyId, setBusyId] = useState<string>()
  const [error, setError] = useState('')

  const beginRename = (chat: ChatHistoryItem) => {
    setEditingId(chat.id)
    setTitle(chat.title)
    setError('')
  }

  const rename = async (id: string) => {
    const nextTitle = title.replace(/\s+/g, ' ').trim()
    if (!nextTitle || nextTitle.length > 80) {
      setError('The title must be between 1 and 80 characters.')
      return
    }
    setBusyId(id)
    setError('')
    const response = await fetch(`/api/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: nextTitle }),
    })
    setBusyId(undefined)
    if (!response.ok) {
      setError('The conversation could not be renamed.')
      return
    }
    setChats((items) =>
      items.map((item) => (item.id === id ? { ...item, title: nextTitle } : item)),
    )
    setEditingId(undefined)
  }

  const remove = async (chat: ChatHistoryItem) => {
    if (!window.confirm(`Delete “${chat.title}”? This cannot be undone.`)) return
    setBusyId(chat.id)
    setError('')
    const response = await fetch(`/api/chat/conversations/${chat.id}`, { method: 'DELETE' })
    setBusyId(undefined)
    if (!response.ok) {
      setError('The conversation could not be deleted.')
      return
    }
    setChats((items) => items.filter((item) => item.id !== chat.id))
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">My chats</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Conversation history
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Resume, rename, or delete your saved HealthBridge Assistant chats.
          </p>
        </div>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" /> New chat
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      {chats.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-teal-600" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">No saved conversations yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Start a chat and it will appear here automatically.
          </p>
          <Link href="/chat" className="mt-5 inline-block font-bold text-teal-700 hover:underline">
            Start your first chat →
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chats.map((chat) => (
            <article
              key={chat.id}
              className="flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {editingId === chat.id ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    void rename(chat.id)
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    autoFocus
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={80}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                    aria-label="Conversation title"
                  />
                  <button
                    disabled={busyId === chat.id}
                    className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(undefined)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Cancel rename"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <h2 className="line-clamp-2 flex-1 font-bold text-slate-900">{chat.title}</h2>
                  <button
                    type="button"
                    onClick={() => beginRename(chat)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                    aria-label={`Rename ${chat.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                {chat.preview || 'Saved conversation'}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock className="h-4 w-4" /> {formatDate(chat.lastMessageAt)} ·{' '}
                {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/chat/${chat.id}`}
                  className="flex-1 rounded-xl bg-teal-50 px-3 py-2 text-center text-sm font-bold text-teal-700 hover:bg-teal-100"
                >
                  Resume
                </Link>
                <button
                  type="button"
                  disabled={busyId === chat.id}
                  onClick={() => void remove(chat)}
                  className="rounded-xl border border-red-100 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={`Delete ${chat.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

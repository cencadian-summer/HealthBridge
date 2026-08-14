import type { Metadata } from 'next'
import { ArrowLeft, LayoutDashboard, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { listOwnedConversations } from '@/lib/chat/store'
import { createClient } from '@/lib/supabase/server'
import { ChatHistoryClient } from './ChatHistoryClient'

export const metadata: Metadata = {
  title: 'My chats | HealthBridge',
  description: 'Review and continue your saved HealthBridge Assistant conversations.',
}

export default async function ChatHistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const chats = await listOwnedConversations(user.id)

  return (
    <div className="min-h-screen bg-[#f6f9fb] text-slate-800 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-700"
            >
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </Link>
            <Link
              href="/dashboard/chats"
              className="flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-700"
            >
              <MessageCircle className="h-5 w-5" /> My Chats
            </Link>
          </nav>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <ChatHistoryClient initialChats={chats} />
      </main>
    </div>
  )
}

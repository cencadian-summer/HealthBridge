import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getUserName } from '@/lib/supabase/userProfile'
import { findOwnedConversation, getConversationMessages } from '@/lib/chat/store'
import { ChatClient } from '../ChatClient'

export const metadata: Metadata = {
  title: 'Saved chat | HealthBridge',
  description: 'Continue a saved HealthBridge Assistant conversation.',
}

export default async function SavedChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-f\d]{24}$/i.test(id)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const conversation = await findOwnedConversation(user.id, id)
  if (!conversation) notFound()

  const messages = await getConversationMessages(conversation.id, user.id)
  const firstName = getUserName(user).trim().split(/\s+/)[0] || undefined

  return (
    <ChatClient
      firstName={firstName}
      initialConversationId={conversation.id}
      initialMessages={messages}
      initialTitle={conversation.title}
      isAuthenticated
    />
  )
}

import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { getUserName } from '@/lib/supabase/userProfile'
import { ChatClient } from './ChatClient'

export const metadata: Metadata = {
  title: 'HealthBridge Assistant | HealthBridge',
  description: 'Ask general questions about navigating healthcare in Canada.',
}

export default async function ChatPage() {
  let user = null
  try {
    const supabase = await createClient()
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    // Chat remains available to guests when Supabase is not configured.
  }

  const firstName = user ? getUserName(user).trim().split(/\s+/)[0] : undefined
  return <ChatClient firstName={firstName} isAuthenticated={Boolean(user)} />
}

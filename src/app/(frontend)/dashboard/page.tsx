import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import {
  getUserAudiences,
  getUserName,
  getUserRole,
  hasCompletedOnboarding,
} from '@/lib/supabase/userProfile'
import { PersonalizedDashboard } from './NewImmigrantDashboard'

export const metadata: Metadata = {
  title: 'Dashboard | HealthBridge',
  description: 'Your personalized HealthBridge dashboard.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!hasCompletedOnboarding(user)) redirect('/onboarding')

  const firstName = getUserName(user).trim().split(/\s+/)[0] || 'there'

  return (
    <PersonalizedDashboard
      audiences={getUserAudiences(user)}
      firstName={firstName}
      role={getUserRole(user)}
    />
  )
}

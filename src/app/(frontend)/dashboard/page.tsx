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
import { InternationalStudentDashboard } from './InternationalStudentDashboard'
import { ParentFamilyDashboard } from './ParentFamilyDashboard'
import { YouthTeenDashboard } from './YouthTeenDashboard'

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
  const audiences = getUserAudiences(user)

  if (audiences[0] === 'international-student') {
    return <InternationalStudentDashboard firstName={firstName} />
  }

  if (audiences[0] === 'parent') {
    return <ParentFamilyDashboard firstName={firstName} />
  }

  if (audiences[0] === 'youth') {
    return <YouthTeenDashboard firstName={firstName} />
  }

  return (
    <PersonalizedDashboard audiences={audiences} firstName={firstName} role={getUserRole(user)} />
  )
}

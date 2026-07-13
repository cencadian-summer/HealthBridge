import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { NewImmigrantDashboard } from './NewImmigrantDashboard'

export const metadata: Metadata = {
  title: 'Dashboard | HealthBridge',
  description: 'Your personalized HealthBridge dashboard.',
}

export default async function DashboardPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) redirect('/login')
  if (!user.onboardingComplete) redirect('/onboarding')

  const firstName = user.name?.trim().split(/s+/)[0] || 'there'

  return <NewImmigrantDashboard firstName={firstName} />
}

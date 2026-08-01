import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'
import { fetchAllTopics } from '@/app/(frontend)/topic/_utils/fetchTopicBySlug'
import {
  getUserAudiences,
  getUserName,
  getUserRole,
  hasCompletedOnboarding,
} from '@/lib/supabase/userProfile'
import { PersonalizedDashboard, type DashboardTopicSuggestion } from './NewImmigrantDashboard'
import { InternationalStudentDashboard } from './InternationalStudentDashboard'
import { ParentFamilyDashboard } from './ParentFamilyDashboard'
import { YouthTeenDashboard } from './YouthTeenDashboard'
import { HealthcareProviderDashboard } from './HealthcareProviderDashboard'
import { SettlementWorkerDashboard } from './SettlementWorkerDashboard'

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

  if (audiences[0] === 'healthcare-provider') {
    return <HealthcareProviderDashboard firstName={firstName} />
  }

  if (audiences[0] === 'settlement-worker') {
    return <SettlementWorkerDashboard firstName={firstName} />
  }

  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const topics = await fetchAllTopics(locale, language)
  const topicSuggestions: DashboardTopicSuggestion[] = topics
    .filter((topic) => Boolean(topic.title?.trim() && topic.slug?.trim()))
    .map((topic) => ({
      label: topic.title,
      description: topic.description || topic.subtitle || '',
      href: localizePath(`/topic/${encodeURIComponent(topic.slug)}`, locale),
      keywords: [
        topic.subtitle,
        ...(topic.sidebarItems || []).map((item) => item.item),
        ...(topic.sections || []).flatMap((section) => [
          section.title,
          section.description,
          ...(section.keyPoints || []).map((point) =>
            typeof point === 'string' ? point : point.point,
          ),
        ]),
      ]
        .filter(Boolean)
        .join(' '),
    }))

  return (
    <PersonalizedDashboard
      audiences={audiences}
      firstName={firstName}
      role={getUserRole(user)}
      topicSuggestions={topicSuggestions}
    />
  )
}

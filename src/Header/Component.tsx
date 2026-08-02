import { HeaderClient } from './Component.client'
import React from 'react'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import { fetchAllTopics } from '@/app/(frontend)/topic/_utils/fetchTopicBySlug'
import { fetchResourceItems } from '@/app/(frontend)/_utils/fetchResourceItems'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const topics = await fetchAllTopics(locale, language)
  const resources = await fetchResourceItems().catch(() => [])
  const isSignedIn = await createClient()
    .then((supabase) => supabase.auth.getUser())
    .then(({ data }) => Boolean(data.user))
    .catch(() => false)

  const topicMenuItems = topics
    .filter((topic) => topic.slug && topic.title)
    .map((topic) => ({
      slug: topic.slug,
      label: topic.title,
    }))

  const resourceMenuItems = resources
    .filter((resource) => resource.slug && resource.title)
    .map((resource) => ({
      slug: resource.slug,
      label: resource.title,
    }))

  return (
    <HeaderClient
      isSignedIn={isSignedIn}
      locale={locale}
      topicMenuItems={topicMenuItems}
      resourceMenuItems={resourceMenuItems}
    />
  )
}

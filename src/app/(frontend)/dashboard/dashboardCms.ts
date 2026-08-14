import type { DashboardProfile } from '@/payload-types'

import type { DashboardIconName, DashboardLink } from './dashboardProfiles'

export type CmsDashboardProfile = DashboardProfile

type CmsLink = {
  customUrl?: string | null
  destination?: {
    relationTo: 'pages' | 'health-topics' | 'resource-items'
    value: string | { slug?: string | null }
  } | null
  detail?: string | null
  highlights?: { id?: string | null; text: string }[] | null
  icon?: DashboardIconName | null
  id?: string | null
  label: string
  status?: 'completed' | 'next' | null
}

export type NormalizedDashboardLink = Omit<DashboardLink, 'icon'> & {
  highlights: string[]
  id: string
  status?: 'completed' | 'next'
}

export type NormalizedDashboardProfile = Omit<
  DashboardProfile,
  | 'accountNavigation'
  | 'alerts'
  | 'contentAreas'
  | 'continueLearning'
  | 'journey'
  | 'primaryNavigation'
  | 'quickActions'
  | 'recommendations'
  | 'savedResources'
  | 'services'
  | 'supportLinks'
  | 'toolkits'
> & {
  accountNavigation: NormalizedDashboardLink[]
  alerts: NormalizedDashboardLink[]
  contentAreas: NormalizedDashboardLink[]
  continueLearning: NormalizedDashboardLink | null
  journey: NormalizedDashboardLink[]
  primaryNavigation: NormalizedDashboardLink[]
  quickActions: NormalizedDashboardLink[]
  recommendations: NormalizedDashboardLink[]
  savedResources: NormalizedDashboardLink[]
  services: NormalizedDashboardLink[]
  supportLinks: NormalizedDashboardLink[]
  toolkits: NormalizedDashboardLink[]
}

const relationshipHref = (destination: CmsLink['destination']): string | null => {
  if (!destination || typeof destination.value === 'string') return null
  const slug = 'slug' in destination.value ? destination.value.slug : null
  if (!slug || typeof slug !== 'string') return null

  if (destination.relationTo === 'health-topics') return `/topic/${slug}`
  if (destination.relationTo === 'resource-items') return `/resources/${slug}`
  return `/${slug}`
}

export function normalizeDashboardLink(link: CmsLink): NormalizedDashboardLink | null {
  const label = link.label?.trim()
  const href = relationshipHref(link.destination) || link.customUrl?.trim()
  if (!label || !href) return null

  const iconName = link.icon || undefined
  return {
    detail: link.detail?.trim() || undefined,
    highlights: link.highlights?.map(({ text }) => text.trim()).filter(Boolean) || [],
    href,
    iconName,
    id: link.id || `${label}:${href}`,
    label,
    status: link.status || undefined,
  }
}

const normalizeLinks = (links: CmsLink[] | null | undefined) =>
  (links || [])
    .map(normalizeDashboardLink)
    .filter((link): link is NormalizedDashboardLink => Boolean(link))

export function normalizeDashboardProfile(profile: DashboardProfile): NormalizedDashboardProfile {
  return {
    ...profile,
    accountNavigation: normalizeLinks(profile.accountNavigation),
    alerts: normalizeLinks(profile.alerts),
    contentAreas: normalizeLinks(profile.contentAreas),
    continueLearning: profile.continueLearning?.label
      ? normalizeDashboardLink(profile.continueLearning)
      : null,
    journey: normalizeLinks(profile.journey),
    primaryNavigation: normalizeLinks(profile.primaryNavigation),
    quickActions: normalizeLinks(profile.quickActions),
    recommendations: normalizeLinks(profile.recommendations),
    savedResources: normalizeLinks(profile.savedResources),
    services: normalizeLinks(profile.services),
    supportLinks: normalizeLinks(profile.supportLinks),
    toolkits: normalizeLinks(profile.toolkits),
  }
}

export function personalizeDashboardHeading(
  heading: string | null | undefined,
  firstName: string,
  fallback = 'Welcome back, {firstName}! 👋',
): string {
  return (heading?.trim() || fallback).replaceAll('{firstName}', firstName)
}

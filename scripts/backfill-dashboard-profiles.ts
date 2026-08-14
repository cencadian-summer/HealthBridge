import 'dotenv/config'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { DashboardProfile } from '../src/payload-types'

type Profile = DashboardProfile['profile']
type SeedLink = { customUrl: string; detail?: string; icon?: string; label: string }

const profiles: Profile[] = [
  'new-immigrant',
  'international-student',
  'parent',
  'youth',
  'refugee',
  'healthcare-provider',
  'settlement-worker',
  'other',
]

const primaryNavigation: SeedLink[] = [
  { label: 'Dashboard', icon: 'LayoutDashboard', customUrl: '/dashboard' },
  { label: 'My Chats', icon: 'MessageCircle', customUrl: '/dashboard/chats' },
  { label: 'My Learning', icon: 'BookOpen', customUrl: '/topic' },
  { label: 'Resources', icon: 'FolderOpen', customUrl: '/resources' },
  { label: 'Find Services', icon: 'MapPin', customUrl: '/resources/healthcare-services' },
]

const accountNavigation: SeedLink[] = [
  { label: 'My Profile', icon: 'UserRound', customUrl: '/account' },
  { label: 'Settings', icon: 'Settings', customUrl: '/account' },
  { label: 'Help & Support', icon: 'MessageCircleQuestion', customUrl: '/contact' },
]

const profileSeeds: Record<Profile, { actions: SeedLink[]; areas: SeedLink[] }> = {
  'new-immigrant': {
    actions: [
      {
        label: 'Find a Family Doctor',
        icon: 'UserRound',
        customUrl: '/family-doctor-registration',
      },
      { label: 'Mental Support', icon: 'HeartHandshake', customUrl: '/manitoba-mental-support' },
      { label: 'Walk-in Clinics', icon: 'Hospital', customUrl: '/walk-in-clinic' },
      { label: 'Lab Results', icon: 'Microscope', customUrl: '/common-lab-test' },
    ],
    areas: [],
  },
  'international-student': {
    actions: [
      { label: 'Student Health Insurance', icon: 'ShieldCheck', customUrl: '/topic/safety-info' },
      {
        label: 'Campus Health Clinic',
        icon: 'Hospital',
        customUrl: '/resources/healthcare-services',
      },
      { label: 'Family Doctor', icon: 'Stethoscope', customUrl: '/topic/healthcare-system' },
      { label: 'Mental Health Support', icon: 'HeartHandshake', customUrl: '/topic/mental-health' },
    ],
    areas: [
      {
        label: 'Canadian Health Care System',
        detail: 'Clinics, doctors, appointments, and urgent care.',
        icon: 'Hospital',
        customUrl: '/topic/healthcare-system',
      },
      {
        label: 'Lab Tests',
        detail: 'Common tests, results, and follow-up.',
        icon: 'Microscope',
        customUrl: '/topic/lab-tests',
      },
      {
        label: 'Nutrition & Healthy Living',
        detail: 'Affordable food and healthy student living.',
        icon: 'Apple',
        customUrl: '/topic/nutrition',
      },
      {
        label: 'Mental Health',
        detail: 'Stress, isolation, culture shock, and counselling.',
        icon: 'HeartHandshake',
        customUrl: '/topic/mental-health',
      },
    ],
  },
  parent: {
    actions: [
      { label: 'Find a Family Doctor', icon: 'Stethoscope', customUrl: '/topic/healthcare-system' },
      { label: 'Child Immunization', icon: 'ShieldCheck', customUrl: '/topic/public-health' },
    ],
    areas: [],
  },
  youth: {
    actions: [
      { label: 'Mental Health Support', icon: 'HeartHandshake', customUrl: '/topic/mental-health' },
      { label: 'Youth Health Rights', icon: 'ShieldCheck', customUrl: '/topic/youth-health' },
    ],
    areas: [],
  },
  refugee: {
    actions: [
      { label: 'Health Coverage', icon: 'CreditCard', customUrl: '/resources' },
      {
        label: 'Interpreter Services',
        icon: 'Languages',
        customUrl: '/resources/language-support',
      },
    ],
    areas: [],
  },
  'healthcare-provider': {
    actions: [
      { label: 'Search Resources', icon: 'Search', customUrl: '/resources' },
      { label: 'Share a Resource', icon: 'Share2', customUrl: '/resources' },
    ],
    areas: [],
  },
  'settlement-worker': {
    actions: [
      { label: 'Search Resources', icon: 'Search', customUrl: '/resources' },
      { label: 'Share a Resource', icon: 'Share2', customUrl: '/resources' },
    ],
    areas: [],
  },
  other: {
    actions: [
      { label: 'Browse Health Topics', icon: 'BookOpen', customUrl: '/topic' },
      { label: 'Find Services', icon: 'MapPin', customUrl: '/resources' },
    ],
    areas: [],
  },
}

async function resolveLink(payload: Payload, link: SeedLink) {
  const match = link.customUrl.match(/^\/(topic|resources)?\/?([^/?#]+)$/)
  const collection =
    match?.[1] === 'topic'
      ? 'health-topics'
      : match?.[1] === 'resources'
        ? 'resource-items'
        : match?.[2]
          ? 'pages'
          : null
  if (collection && match?.[2]) {
    const found = await payload.find({
      collection,
      where: { slug: { equals: match[2] } },
      limit: 1,
      depth: 0,
    })
    if (found.docs[0])
      return {
        ...link,
        customUrl: undefined,
        destination: { relationTo: collection, value: found.docs[0].id },
      }
  }
  return link
}

async function main() {
  const payload = await getPayload({ config })
  for (const profile of profiles) {
    const found = await payload.find({
      collection: 'dashboard-profiles',
      where: { profile: { equals: profile } },
      limit: 1,
      depth: 0,
      draft: false,
    })
    const doc = found.docs[0]
    if (!doc) {
      payload.logger.warn(`Dashboard profile not found: ${profile}`)
      continue
    }
    const seed = profileSeeds[profile]
    const data: Record<string, unknown> = {}
    const existingPrimaryNavigation = doc.primaryNavigation || []
    const hasMyChats = existingPrimaryNavigation.some(
      (item) =>
        item.label.trim().toLowerCase() === 'my chats' ||
        item.customUrl?.trim() === '/dashboard/chats',
    )
    if (existingPrimaryNavigation.length === 0) {
      data.primaryNavigation = await Promise.all(
        primaryNavigation.map((link) => resolveLink(payload, link)),
      )
    } else if (!hasMyChats) {
      const myChats = await resolveLink(payload, primaryNavigation[1])
      data.primaryNavigation = [
        existingPrimaryNavigation[0],
        myChats,
        ...existingPrimaryNavigation.slice(1),
      ]
    }
    for (const [field, links] of Object.entries({
      accountNavigation,
      quickActions: seed.actions,
      contentAreas: seed.areas,
    })) {
      if (links.length === 0) continue
      if (
        !doc[field as keyof DashboardProfile] ||
        (doc[field as keyof DashboardProfile] as unknown[]).length === 0
      ) {
        data[field] = await Promise.all(links.map((link) => resolveLink(payload, link)))
      }
    }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'dashboard-profiles', id: doc.id, data, draft: false })
      payload.logger.info(`Backfilled dashboard fields: ${profile}`)
    } else payload.logger.info(`No dashboard changes needed: ${profile}`)
  }
  process.exit(0)
}

void main()

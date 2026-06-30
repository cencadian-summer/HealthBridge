import Image from 'next/image'
import Link from 'next/link'
import {
  BadgePlus,
  Brain,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  Hospital,
  MessageCircleQuestion,
  PhoneCall,
  ShieldPlus,
  Stethoscope,
  Syringe,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  fetchAllTopics,
  fetchAllTopicsUncached,
  type MediaFromPayload,
} from './_utils/fetchTopicBySlug'
import { TopicRedirectNotice } from './TopicRedirectNotice'
import { TopicSearchFilter } from './TopicSearchFilter'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import type { Locale } from '@/i18n/config'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { resolveFallbackTopicSlug } from './_utils/staticTopicFallbacks'

// ── Icon map: matches values from the HealthTopics Payload collection ──────────
const ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope,
  FlaskConical,
  HeartPulse,
  Brain,
  Users,
  ShieldPlus,
  Syringe,
  ClipboardCheck,
  BadgePlus,
  Hospital,
  PhoneCall,
  MessageCircleQuestion,
}

// ── Static fallback data (shown when no topics exist in the CMS yet) ──────────
const STATIC_TOPICS = [
  {
    id: 'understanding-canadian-healthcare',
    slug: 'healthcare-system',
    label: 'Understanding Canadian Healthcare',
    desc: 'Learn how the Canadian healthcare system works.',
    lessons: 12,
    iconName: 'Stethoscope',
  },
  {
    id: 'interpreting-lab-test-results',
    slug: 'healthcare-system',
    label: 'Interpreting Lab Test Results',
    desc: 'Understand common lab tests and reports.',
    lessons: 10,
    iconName: 'FlaskConical',
  },
  {
    id: 'nutrition-healthy-living',
    slug: 'nutrition',
    label: 'Nutrition and Healthy Living',
    desc: 'Healthy eating tips and balanced lifestyle.',
    lessons: 14,
    iconName: 'HeartPulse',
  },
  {
    id: 'mental-health-resources',
    slug: 'mental-health',
    label: 'Mental Health Resources',
    desc: 'Support your mental well-being.',
    lessons: 11,
    iconName: 'Brain',
  },
  {
    id: 'sexual-health-youth-education',
    slug: 'youth-health',
    label: 'Sexual Health and Youth Education',
    desc: 'Age-appropriate health education for youth.',
    lessons: 9,
    iconName: 'Users',
  },
  {
    id: 'public-health-safety-information',
    slug: 'public-health',
    label: 'Public Health and Safety Information',
    desc: 'Stay informed and safe in your community.',
    lessons: 13,
    iconName: 'ShieldPlus',
  },
  {
    id: 'vaccination-immunization',
    slug: 'public-health',
    label: 'Vaccination and Immunization',
    desc: 'Stay up to date on vaccines for you and your family.',
    lessons: 8,
    iconName: 'Syringe',
  },
  {
    id: 'health-insurance-settlement-support',
    slug: 'safety-info',
    label: 'Health Insurance and Settlement Support',
    desc: 'Understand insurance and other settlement help.',
    lessons: 7,
    iconName: 'ClipboardCheck',
  },
]

export default async function TopicIndexPage() {
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const cachedTopics = await fetchAllTopics(locale, language)
  const cmsTopics =
    cachedTopics.length > 0 ? cachedTopics : await fetchAllTopicsUncached(locale, language)

  // Use CMS data if available, otherwise fall back to static list
  const topics =
    cmsTopics.length > 0
      ? cmsTopics.map((t) => {
          const media =
            t.iconImage && typeof t.iconImage === 'object'
              ? (t.iconImage as MediaFromPayload)
              : null
          const badgeMedia =
            t.badgeImage && typeof t.badgeImage === 'object'
              ? (t.badgeImage as MediaFromPayload)
              : null

          const canonicalSlug = resolveFallbackTopicSlug(t.slug)

          return {
            id: t.id,
            slug: canonicalSlug,
            label: t.title,
            desc: t.description ?? '',
            lessons: t.lessonsCount ?? 10,
            iconName: t.icon ?? 'Stethoscope',
            iconImageUrl: getMediaUrl(media?.url) || null,
            iconImageAlt: media?.alt ?? t.title,
            badgeImageUrl: getMediaUrl(badgeMedia?.url) || null,
            badgeImageAlt: badgeMedia?.alt ?? t.title,
          }
        })
      : STATIC_TOPICS.map((t) => ({
          ...t,
          slug: resolveFallbackTopicSlug(t.slug),
          iconImageUrl: null,
          iconImageAlt: '',
          badgeImageUrl: null,
          badgeImageAlt: '',
        }))

  return (
    <section className="space-y-4">
      <TopicRedirectNotice
        locale={locale}
        topics={topics.map((topic) => ({ id: topic.id, slug: topic.slug, label: topic.label }))}
      />

      <TopicSearchFilter
        locale={locale}
        topics={topics.map((t) => ({
          id: t.id,
          slug: t.slug,
          label: t.label,
          desc: t.desc,
          lessons: t.lessons,
          iconName: t.iconName,
          iconImageUrl: t.iconImageUrl,
          iconImageAlt: t.iconImageAlt,
          badgeImageUrl: t.badgeImageUrl,
          badgeImageAlt: t.badgeImageAlt,
        }))}
      />

      <div className="mt-1 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-950/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-blue-200 bg-white p-2 text-blue-700 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-400">
              <MessageCircleQuestion className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[28px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Need help finding the right topic?
              </p>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Use our Ask a Question tool or chat with our support team.
              </p>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              className="flex-1 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 sm:flex-none dark:border-blue-700 dark:bg-slate-800 dark:text-blue-400"
            >
              Ask a Question
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:flex-none"
            >
              Chat with Support
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

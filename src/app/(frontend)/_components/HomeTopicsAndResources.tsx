'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  BadgePlus,
  Brain,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FlaskConical,
  HeartPulse,
  HelpingHand,
  Hospital,
  MessageCircleQuestion,
  PhoneCall,
  Salad,
  ShieldCheck,
  ShieldPlus,
  Stethoscope,
  Syringe,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { localizePath } from '@/i18n/routing'
import type { Locale } from '@/i18n/config'
import { getTopicAccent } from '../topic/_utils/topicVisuals'
import { PopularResourcesSection, type PopularResourceItem } from './PopularResourcesSection'

export type HomeTopic = {
  id: string
  title: string
  description: string
  slug: string
  icon: string | null
  iconImageUrl: string | null
  iconImageAlt: string
  badgeImageUrl: string | null
  badgeImageAlt: string
}

export type HolisticCard = {
  id: string
  title: string
  description: string
  imageUrl: string | null
  imageAlt: string
}

type Props = {
  locale: Locale
  topics: HomeTopic[]
  holisticHeading: string
  holisticDescription: string
  holisticLinkLabel: string
  holisticLinkUrl: string
  holisticCards: HolisticCard[]
  popularResources: PopularResourceItem[]
  popularResourcesHeading?: string
  popularResourcesDescription?: string
  popularResourcesViewAllLabel?: string
  popularResourcesViewAllUrl?: string
}

const CLIENT_TOPIC_FALLBACKS: HomeTopic[] = [
  {
    id: 'healthcare-system',
    title: 'Understanding Canadian Healthcare',
    description: 'Learn how the healthcare system works in Canada.',
    slug: 'healthcare-system',
    icon: 'Stethoscope',
    iconImageUrl: null,
    iconImageAlt: 'Healthcare',
    badgeImageUrl: null,
    badgeImageAlt: 'Healthcare',
  },
  {
    id: 'mental-health',
    title: 'Mental Health Support',
    description: 'Find resources and tips to support your well-being.',
    slug: 'mental-health',
    icon: 'Brain',
    iconImageUrl: null,
    iconImageAlt: 'Mental Health',
    badgeImageUrl: null,
    badgeImageAlt: 'Mental Health',
  },
  {
    id: 'nutrition',
    title: 'Nutrition and Healthy Living',
    description: 'Discover healthy choices for you and your family.',
    slug: 'nutrition',
    icon: 'HeartPulse',
    iconImageUrl: null,
    iconImageAlt: 'Nutrition',
    badgeImageUrl: null,
    badgeImageAlt: 'Nutrition',
  },
  {
    id: 'youth-health',
    title: 'Youth Education and Safety',
    description: 'Important information for youth and teens.',
    slug: 'youth-health',
    icon: 'Users',
    iconImageUrl: null,
    iconImageAlt: 'Youth Health',
    badgeImageUrl: null,
    badgeImageAlt: 'Youth Health',
  },
]

const TOPIC_ICON_MAP: Record<string, LucideIcon> = {
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

const RESOURCE_ICON_MAP: Record<string, LucideIcon> = {
  FlaskConical,
  Salad,
  HelpingHand,
  FileText,
  ShieldCheck,
  MessageCircleQuestion,
}

type QuickAccessItem = {
  id: string
  title: string
  href: string
  iconName: string | null
  imageUrl: string | null
  imageAlt: string
  kind: 'topic' | 'resource'
  topicSlug?: string
}

export function HomeTopicsAndResources({
  locale,
  topics,
  holisticHeading,
  holisticDescription,
  holisticLinkLabel,
  holisticLinkUrl,
  holisticCards,
  popularResources,
  popularResourcesHeading,
  popularResourcesDescription,
  popularResourcesViewAllLabel,
  popularResourcesViewAllUrl,
}: Props) {
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set())

  const effectiveTopics = useMemo(() => {
    const normalizedTopics = (topics || []).filter((topic) => {
      return Boolean(topic?.id && topic?.title?.trim() && topic?.slug?.trim())
    })

    return normalizedTopics.length > 0 ? normalizedTopics : CLIENT_TOPIC_FALLBACKS
  }, [topics])

  const getTopicHref = (slug: string) => {
    const normalized = slug.trim().replace(/^\/+|\/+$/g, '')

    if (!normalized) {
      return localizePath('/topic', locale)
    }

    return localizePath(`/topic/${encodeURIComponent(normalized)}`, locale)
  }

  const displayTopics = useMemo(
    () => (showAllTopics ? effectiveTopics : effectiveTopics.slice(0, 4)),
    [showAllTopics, effectiveTopics],
  )

  const quickAccessItems = useMemo<QuickAccessItem[]>(() => {
    const topicItems = effectiveTopics.slice(0, 3).map((topic) => ({
      id: `topic-${topic.id}`,
      title: topic.title,
      href: getTopicHref(topic.slug),
      iconName: topic.icon,
      imageUrl: topic.iconImageUrl,
      imageAlt: topic.iconImageAlt,
      kind: 'topic' as const,
      topicSlug: topic.slug,
    }))

    const resourceItems = (popularResources || [])
      .filter((resource) => resource?.id && resource?.title && resource?.href)
      .slice(0, 3)
      .map((resource) => ({
        id: `resource-${resource.id}`,
        title: resource.title,
        href: localizePath(resource.href, locale),
        iconName: resource.icon,
        imageUrl: resource.imageUrl || null,
        imageAlt: resource.imageAlt || resource.title,
        kind: 'resource' as const,
      }))

    return [...topicItems, ...resourceItems]
  }, [effectiveTopics, popularResources, locale])

  const markImageFailed = (topicId: string) => {
    setFailedImageIds((prev) => {
      if (prev.has(topicId)) return prev
      const next = new Set(prev)
      next.add(topicId)
      return next
    })
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Quick Access
        </p>
        <p className="mt-1 px-2 text-xs text-slate-500 dark:text-slate-400">
          Major health topics and resources
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickAccessItems.map((item, index) => {
            const topicAccent =
              item.kind === 'topic'
                ? getTopicAccent(item.topicSlug || 'healthcare-system', item.iconName)
                : {
                    card: 'hover:border-blue-300 dark:hover:border-blue-600',
                    frame:
                      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                    arrow: 'text-blue-700 dark:text-blue-300',
                  }
            const TopicIcon =
              item.kind === 'topic'
                ? item.iconName
                  ? TOPIC_ICON_MAP[item.iconName]
                  : undefined
                : item.iconName
                  ? RESOURCE_ICON_MAP[item.iconName]
                  : undefined
            const canRenderImage = Boolean(item.imageUrl) && !failedImageIds.has(item.id)

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group animate-fadeInScale inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${topicAccent.card}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm ${topicAccent.frame}`}
                >
                  {canRenderImage ? (
                    <Image
                      src={item.imageUrl as string}
                      alt={item.imageAlt}
                      width={44}
                      height={44}
                      className="h-full w-full rounded-full object-cover"
                      onError={() => markImageFailed(item.id)}
                    />
                  ) : TopicIcon ? (
                    <TopicIcon className="h-5 w-5" strokeWidth={1.9} />
                  ) : (
                    <span className="text-sm font-bold">
                      {item.title.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1 truncate leading-5">{item.title}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 ${topicAccent.arrow}`} />
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-6 px-6 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {holisticHeading}
          </h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {holisticDescription}{' '}
            <Link
              href={localizePath(holisticLinkUrl, locale)}
              className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-800 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300"
            >
              {holisticLinkLabel}
            </Link>
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {holisticCards.map((card, index) => {
            const imageId = `holistic-${card.id}`
            const canRenderImage = Boolean(card.imageUrl) && !failedImageIds.has(imageId)
            const PlaceholderIcon = [Stethoscope, Users, PhoneCall][index] || Stethoscope

            return (
              <article className="px-2 text-center" key={card.id}>
                <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900">
                  {canRenderImage ? (
                    <Image
                      alt={card.imageAlt}
                      className="h-full w-full object-cover"
                      height={112}
                      onError={() => markImageFailed(imageId)}
                      src={card.imageUrl as string}
                      width={112}
                    />
                  ) : (
                    <PlaceholderIcon aria-hidden="true" className="h-10 w-10" />
                  )}
                </div>
                <p className="text-lg font-semibold leading-tight text-slate-900 dark:text-white">
                  {card.title}
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Health Topics
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Practical health guidance tailored for newcomers in Canada.
          </p>
        </div>
        {effectiveTopics.length > 4 ? (
          <button
            type="button"
            onClick={() => setShowAllTopics((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/40"
          >
            {showAllTopics ? 'Show Less' : 'View More Health Topics'}
            <ChevronRight
              className={`h-4 w-4 transition-transform ${showAllTopics ? 'rotate-90' : ''}`}
            />
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {displayTopics.map((topic, index) => {
          const topicAccent = getTopicAccent(topic.slug, topic.icon)
          const TopicIcon = topic.icon ? TOPIC_ICON_MAP[topic.icon] : undefined
          const badgeImageId = `${topic.id}-badge`
          const canRenderImage = Boolean(topic.iconImageUrl) && !failedImageIds.has(topic.id)
          const canRenderBadgeImage =
            Boolean(topic.badgeImageUrl) && !failedImageIds.has(badgeImageId)

          return (
            <Link
              key={topic.id}
              href={getTopicHref(topic.slug)}
              className={`group animate-fadeInScale rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 ${topicAccent.card}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`relative mb-3 flex h-28 items-end overflow-hidden rounded-xl bg-gradient-to-br p-2.5 ${topicAccent.panel}`}
              >
                {canRenderImage ? (
                  <Image
                    src={topic.iconImageUrl!}
                    alt={topic.iconImageAlt}
                    fill
                    sizes="(min-width: 1280px) 280px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    onError={() => markImageFailed(topic.id)}
                  />
                ) : null}
                <span
                  className="absolute inset-0 bg-gradient-to-t from-white/55 via-white/20 to-transparent dark:from-slate-900/60 dark:via-slate-900/20"
                  aria-hidden="true"
                />
                <span
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm backdrop-blur-sm ${topicAccent.frame}`}
                >
                  {canRenderBadgeImage ? (
                    <Image
                      src={topic.badgeImageUrl as string}
                      alt={topic.badgeImageAlt}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                      onError={() => markImageFailed(badgeImageId)}
                    />
                  ) : TopicIcon ? (
                    <TopicIcon className="h-5 w-5" strokeWidth={1.85} />
                  ) : (
                    <span className="text-base font-bold">
                      {topic.title.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
              </div>
              <h3 className="text-[15px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                {topic.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-600 dark:text-slate-400">
                {topic.description}
              </p>
              <span
                className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${topicAccent.arrow}`}
              >
                Learn More
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          )
        })}
      </div>

      <PopularResourcesSection
        locale={locale}
        heading={popularResourcesHeading}
        description={popularResourcesDescription}
        viewAllLabel={popularResourcesViewAllLabel}
        viewAllUrl={popularResourcesViewAllUrl}
        resources={popularResources}
      />
    </section>
  )
}

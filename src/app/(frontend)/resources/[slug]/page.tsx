import type { Metadata } from 'next'
import type { LucideIcon } from 'lucide-react'
import {
  Check,
  HeartPulse,
  Hospital,
  ShieldAlert,
  Brain,
  BookOpen,
  FlaskConical,
  Apple,
  Globe,
  Users,
  Languages,
  FileText,
  Pill,
  PhoneCall,
  PlayCircle,
} from 'lucide-react'

import Link from 'next/link'
import { VideoEmbed } from '@/components/VideoEmbed'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import { defaultLocale, isCmsLocale, type Locale } from '@/i18n/config'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'
import type { Page } from '@/payload-types'
import { translateContentDeep } from '@/utilities/translateContent'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { ResourceHeroImage } from './ResourceHeroImage'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

type HelpfulLink = {
  id?: string | null
  label?: string | null
  href?: string | null
  description?: string | null
}

type ResourceDetail = {
  id: string
  title: string
  slug: string
  sidebarTitle?: string
  description: string
  detailIntro?: string
  videoDuration?: string
  videoUrl?: string
  guideUrl?: string
  guideLabel?: string
  supportPhone?: string
  sections?: Array<{
    title: string
    description: string
    detailPageSlug: string
    keyPoints: string[]
  }> | null
  detailContent?: unknown
  resourceLayout?: Page['layout'][0][] | null
  heroImage?: { url?: string; alt?: string } | null
  helpfulLinks?: HelpfulLink[] | null
  icon?: string
}

type ResourceSidebarItem = {
  id: string
  title: string
  slug: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  Hospital,
  ShieldAlert,
  Brain,
  BookOpen,
  FlaskConical,
  Apple,
  Globe,
  HeartPulse,
  Pill,
  Users,
  FileText,
  Languages,
  PlayCircle,
}

const pickSectionIcon = (resourceTitle: string, resourceIcon?: string): LucideIcon => {
  if (resourceIcon && ICON_MAP[resourceIcon]) {
    return ICON_MAP[resourceIcon]
  }

  const normalized = resourceTitle.toLowerCase()
  if (normalized.includes('lab') || normalized.includes('test')) return FlaskConical
  if (normalized.includes('mental')) return Brain
  if (normalized.includes('nutrition')) return Apple
  if (normalized.includes('youth')) return HeartPulse
  if (normalized.includes('community')) return Users

  return Hospital
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const resources = await payload.find({
    collection: 'resource-items',
    draft: false,
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return resources.docs
    .map(({ slug }) => ({ slug: typeof slug === 'string' ? slug : '' }))
    .filter((item) => item.slug.length > 0)
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const decodedSlug = decodeURIComponent(slug)

  const resource = await queryResourceBySlug({
    slug: decodedSlug,
    locale,
    targetLanguage: language,
  })

  return {
    title: resource ? `${resource.title} | Resources` : 'Resource | Resources',
    description: resource?.detailIntro || resource?.description || undefined,
  }
}

export default async function ResourceDetailPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const decodedSlug = decodeURIComponent(slug)
  const url = `/resources/${decodedSlug}`

  const resource = await queryResourceBySlug({
    slug: decodedSlug,
    locale,
    targetLanguage: language,
  })

  if (!resource) {
    return <PayloadRedirects url={url} />
  }

  const sidebarItems = await queryResourceSidebarItems({ locale, targetLanguage: language })
  const Icon = ICON_MAP[resource.icon || ''] ?? Hospital
  const CardIcon = pickSectionIcon(resource.title, resource.icon)
  const sectionItems = Array.isArray(resource.sections) ? resource.sections : []
  const hasSectionCards = sectionItems.length > 0
  const hasHelpfulLinks = Array.isArray(resource.helpfulLinks) && resource.helpfulLinks.length > 0

  if (hasSectionCards) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[246px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <h2 className="text-2xl font-semibold tracking-tight text-blue-700 dark:text-blue-300">
                {resource.sidebarTitle || 'Resources Overview'}
              </h2>
              <Link
                href={localizePath('/resources', locale)}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 dark:text-blue-300"
              >
                &lt; Back to Resources
              </Link>

              <nav className="mt-4 space-y-1.5" aria-label="Resource navigation">
                {sidebarItems.map((item) => {
                  const href = localizePath(`/resources/${item.slug}`, locale)
                  const isActive = item.slug === resource.slug

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold leading-tight transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-slate-700'
                      }`}
                    >
                      {item.title}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
              <h3 className="text-xl font-semibold tracking-tight text-blue-700 dark:text-blue-300">
                Need Help?
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Ask our team a question and we&apos;ll point you to the right direction.
              </p>
              <Link
                href={localizePath('/contact', locale)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 dark:border-blue-800 dark:bg-slate-900/30 dark:text-blue-300"
              >
                <PhoneCall className="h-4 w-4" />
                Ask a Question
              </Link>
            </div>

            {resource.guideUrl ? (
              <a
                href={resource.guideUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-blue-100 bg-blue-50/70 p-4 transition-opacity hover:opacity-90 dark:border-blue-900/40 dark:bg-blue-900/20"
              >
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Download Guide
                  <span className="ml-auto rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    PDF
                  </span>
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {resource.guideLabel || 'A quick guide for this resource topic.'}
                </p>
              </a>
            ) : null}
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-blue-700 sm:text-5xl dark:text-blue-300">
                  {resource.title}
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  {resource.detailIntro || resource.description}
                </p>
              </div>
            </div>

            {resource.videoUrl ? (
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Watch Overview Video
                  </h2>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {resource.videoDuration || '3 min'}
                  </span>
                </div>
                <VideoEmbed url={resource.videoUrl} title={`${resource.title} overview video`} />
              </div>
            ) : null}

            <div className="space-y-2.5">
              {sectionItems.map((section, index) => (
                <article
                  key={`${section.title}-${index}`}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors md:grid-cols-[214px_minmax(0,1fr)_222px] dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/30">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-white/30 dark:bg-white/10" />
                    <div className="absolute -bottom-7 -right-8 h-20 w-20 rounded-full bg-white/40 dark:bg-white/10" />
                    <div className="z-10 rounded-full border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-800 dark:bg-slate-900/50">
                      <CardIcon
                        className="h-11 w-11 text-blue-700 dark:text-blue-300"
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-[33px] font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                      {index + 1}. {section.title}
                    </h2>
                    <p className="mt-1.5 text-[16px] leading-6 text-slate-600 dark:text-slate-300">
                      {section.description}
                    </p>

                    {section.detailPageSlug ? (
                      <Link
                        href={localizePath(
                          `/${encodeURIComponent(section.detailPageSlug)}`,
                          locale,
                        )}
                        className="mt-2 inline-flex text-sm font-semibold text-blue-700 dark:text-blue-300"
                      >
                        Learn More <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <span className="mt-2 inline-flex text-sm font-semibold text-slate-400 dark:text-slate-500">
                        Learn More <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/40 dark:bg-blue-900/20">
                    <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Key Points:
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                      {section.keyPoints.map((point) => (
                        <li key={point} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-700 dark:text-blue-300" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-900/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[27px] font-semibold leading-tight tracking-tight text-blue-700 dark:text-blue-300">
                    Need help understanding your test result?
                  </p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Talk to your doctor or healthcare provider if you have questions.
                  </p>
                </div>
                <p className="text-4xl font-bold tracking-tight text-blue-700 dark:text-blue-300">
                  {resource.supportPhone || '1-888-315-9257'}
                </p>
              </div>
            </div>

            {Array.isArray(resource.resourceLayout) && resource.resourceLayout.length > 0 ? (
              <div className="mt-6">
                <RenderBlocks blocks={resource.resourceLayout} locale={locale} />
              </div>
            ) : resource.detailContent ? (
              <RichText
                className="mt-6"
                data={resource.detailContent as Parameters<typeof RichText>[0]['data']}
                enableGutter={false}
              />
            ) : null}

            {hasHelpfulLinks && (
              <section className="mt-6" aria-label="Helpful links">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Helpful links
                </h2>
                <ul className="mt-3 space-y-3">
                  {(resource.helpfulLinks || []).map((link) => {
                    const href = link?.href || ''
                    const label = link?.label || 'Open resource'
                    const isExternal = href.startsWith('http://') || href.startsWith('https://')

                    if (!href) return null

                    return (
                      <li key={link?.id || `${label}-${href}`}>
                        <a
                          href={href}
                          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noreferrer noopener' : undefined}
                        >
                          {label}
                        </a>
                        {link?.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {link.description}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="resource-detail-page">
      <section className="resource-detail-hero">
        <div className="resources-container resources-container--section">
          <nav aria-label="Breadcrumb" className="resource-detail-breadcrumbs">
            <Link
              href={localizePath('/resources', locale)}
              className="resource-detail-breadcrumb-link"
            >
              Resources
            </Link>
            <span aria-hidden="true" className="resource-detail-breadcrumb-separator">
              /
            </span>
            <span className="resource-detail-breadcrumb-current">{resource.title}</span>
          </nav>

          <div className="resource-detail-title-wrap">
            <div className="resource-detail-icon" aria-hidden="true">
              <Icon size={28} />
            </div>
            <h1 className="resource-detail-title">{resource.title}</h1>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="resource-detail-intro">
                {resource.detailIntro || resource.description}
              </p>
            </div>
            {resource.heroImage && resource.heroImage.url && (
              <div className="resource-detail-hero-image-wrap">
                <ResourceHeroImage
                  src={resource.heroImage.url}
                  alt={resource.heroImage.alt || resource.title}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="resource-detail-body">
        <div className="resources-container resources-container--section">
          <div className="resource-detail-main resource-detail-main--wide">
            {Array.isArray(resource.resourceLayout) && resource.resourceLayout.length > 0 ? (
              <div className="resource-detail-richtext max-w-none">
                <RenderBlocks blocks={resource.resourceLayout} locale={locale} />
              </div>
            ) : resource.detailContent ? (
              <RichText
                className="resource-detail-richtext max-w-none"
                data={resource.detailContent as Parameters<typeof RichText>[0]['data']}
                enableGutter={false}
              />
            ) : (
              <p className="resource-detail-empty">
                Detailed content is coming soon for this resource.
              </p>
            )}
          </div>

          {hasHelpfulLinks && (
            <section className="resource-detail-links-section" aria-label="Helpful links">
              <aside
                className="resource-detail-aside resource-detail-aside--wide"
                aria-label="Helpful links"
              >
                <h2 className="resource-detail-aside-title">Helpful links</h2>
                <ul className="resource-detail-link-list resource-detail-link-list--cards">
                  {(resource.helpfulLinks || []).map((link) => {
                    const href = link?.href || ''
                    const label = link?.label || 'Open resource'
                    const isExternal = href.startsWith('http://') || href.startsWith('https://')

                    if (!href) return null

                    return (
                      <li
                        key={link?.id || `${label}-${href}`}
                        className="resource-detail-link-item resource-detail-link-item--card"
                      >
                        <a
                          href={href}
                          className="resource-detail-link"
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noreferrer noopener' : undefined}
                        >
                          {label}
                        </a>

                        {link?.description && (
                          <p className="resource-detail-link-description">{link.description}</p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </aside>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

const queryResourceBySlug = cache(
  async ({
    slug,
    locale,
    targetLanguage,
  }: {
    slug: string
    locale: Locale
    targetLanguage: string
  }) => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'resource-items',
      depth: 2,
      locale,
      fallbackLocale: defaultLocale,
      draft: false,
      limit: 1,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    const resource = result.docs?.[0] || null
    if (!resource) return null

    const translated = await translateContentDeep(resource, targetLanguage)
    const translatedRecord = translated as Record<string, unknown>

    const heroImageData = translated.heroImage
    const heroImage = heroImageData
      ? {
          url:
            typeof heroImageData === 'object' && heroImageData !== null && 'url' in heroImageData
              ? getMediaUrl(heroImageData.url as string | undefined)
              : undefined,
          alt:
            typeof heroImageData === 'object' && heroImageData !== null && 'alt' in heroImageData
              ? (heroImageData.alt as string | undefined)
              : undefined,
        }
      : null

    return {
      id: String(translated.id),
      title: typeof translated.title === 'string' ? translated.title : '',
      slug: typeof translated.slug === 'string' ? translated.slug : '',
      sidebarTitle:
        typeof translated.sidebarTitle === 'string'
          ? translated.sidebarTitle
          : 'Resources Overview',
      description: typeof translated.description === 'string' ? translated.description : '',
      detailIntro: typeof translated.detailIntro === 'string' ? translated.detailIntro : undefined,
      videoDuration:
        typeof translated.videoDuration === 'string' ? translated.videoDuration : undefined,
      videoUrl: typeof translated.videoUrl === 'string' ? translated.videoUrl : undefined,
      guideUrl: typeof translated.guideUrl === 'string' ? translated.guideUrl : undefined,
      guideLabel: typeof translated.guideLabel === 'string' ? translated.guideLabel : undefined,
      supportPhone:
        typeof translated.supportPhone === 'string' ? translated.supportPhone : undefined,
      sections: Array.isArray(translated.sections)
        ? translated.sections
            .map((section) => {
              const detailPage = section?.detailPage
              const detailPageSlug =
                detailPage && typeof detailPage === 'object' && 'slug' in detailPage
                  ? typeof detailPage.slug === 'string'
                    ? detailPage.slug
                    : ''
                  : ''

              const keyPoints = Array.isArray(section?.keyPoints)
                ? section.keyPoints
                    .map((point) => {
                      if (typeof point === 'string') return point
                      if (point && typeof point === 'object' && 'point' in point) {
                        return typeof point.point === 'string' ? point.point : ''
                      }
                      return ''
                    })
                    .filter((point) => point.length > 0)
                : []

              return {
                title: typeof section?.title === 'string' ? section.title : '',
                description: typeof section?.description === 'string' ? section.description : '',
                detailPageSlug,
                keyPoints,
              }
            })
            .filter((section) => section.title.length > 0)
        : null,
      detailContent: translated.detailContent,
      resourceLayout: Array.isArray(translatedRecord.resourceLayout)
        ? (translatedRecord.resourceLayout as Page['layout'][0][])
        : null,
      heroImage: heroImage ? heroImage : undefined,
      helpfulLinks: Array.isArray(translated.helpfulLinks)
        ? translated.helpfulLinks.map((link) => ({
            id: typeof link?.id === 'string' ? link.id : null,
            label: typeof link?.label === 'string' ? link.label : null,
            href: typeof link?.href === 'string' ? link.href : null,
            description: typeof link?.description === 'string' ? link.description : null,
          }))
        : null,
      icon: typeof translated.icon === 'string' ? translated.icon : 'Hospital',
    } satisfies ResourceDetail
  },
)

const queryResourceSidebarItems = cache(
  async ({ locale, targetLanguage }: { locale: Locale; targetLanguage: string }) => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'resource-items',
      depth: 0,
      locale,
      fallbackLocale: defaultLocale,
      draft: false,
      limit: 100,
      sort: 'order',
      pagination: false,
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    const docs =
      targetLanguage === defaultLocale || isCmsLocale(targetLanguage)
        ? result.docs
        : await translateContentDeep(result.docs, targetLanguage)

    return docs
      .map((doc) => ({
        id: String(doc.id),
        title: typeof doc.title === 'string' ? doc.title : '',
        slug: typeof doc.slug === 'string' ? doc.slug : '',
      }))
      .filter((doc) => doc.title.length > 0 && doc.slug.length > 0) as ResourceSidebarItem[]
  },
)

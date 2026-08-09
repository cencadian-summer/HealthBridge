import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
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
  PlayCircle,
} from 'lucide-react'
import { fetchResourcesGlobal } from '../_utils/fetchResources'
import { STATIC_RESOURCES_FALLBACK } from './_utils/staticResourcesFallback'
import { fetchResourceItems } from '../_utils/fetchResourceItems'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'
import { MultilingualSupportMenu } from './_components/MultilingualSupportMenu'
import { BMICalculator } from './_components/BMICalculator'
import { getStaticMediaURL } from '@/utilities/spacesMedia'

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

const normalizeTopicPagePath = (href: string | undefined): string => {
  const normalized = href?.trim().toLowerCase()

  if (!normalized || normalized === '/health-topics' || normalized === '/topics') {
    return '/topic'
  }

  return href as string
}

const STATIC_RESOURCES = [
  {
    id: 's1',
    title: 'Find Healthcare Services',
    description:
      'Locate family doctors, walk-in clinics, urgent care centres, and hospitals in Manitoba.',
    icon: 'Hospital',
    imageUrl: null,
    imageAlt: 'Find Healthcare Services',
    categoryLabel: 'Community',
    readTime: '3 min read',
    slug: 'healthcare-services',
  },
  {
    id: 's2',
    title: 'Emergency & Crisis Help',
    description: 'Quick access to emergency contacts, crisis lines, and urgent support services.',
    icon: 'ShieldAlert',
    imageUrl: null,
    imageAlt: 'Emergency and Crisis Help',
    categoryLabel: 'Support',
    readTime: '3 min read',
    slug: 'emergency-help',
  },
  {
    id: 's3',
    title: 'Mental Health Support',
    description:
      'Access counseling, wellness support, stress management, and mental health resources.',
    icon: 'Brain',
    imageUrl: null,
    imageAlt: 'Mental Health Support',
    categoryLabel: 'Wellness',
    readTime: '4 min read',
    slug: 'mental-health',
  },
  {
    id: 's4',
    title: 'Health Learning Library',
    description: 'Explore trusted health education topics designed for newcomers and families.',
    icon: 'BookOpen',
    imageUrl: null,
    imageAlt: 'Health Learning Library',
    categoryLabel: 'Learning',
    readTime: '5 min read',
    slug: 'health-library',
  },
  {
    id: 's5',
    title: 'Understand Lab Results',
    description: 'Learn what common lab tests and medical reports mean in simple language.',
    icon: 'FlaskConical',
    imageUrl: null,
    imageAlt: 'Understand Lab Results',
    categoryLabel: 'News',
    readTime: '3 min read',
    slug: 'lab-results',
  },
  {
    id: 's6',
    title: 'Nutrition & Wellness',
    description: 'Learn about healthy eating, food labels, exercise, and family wellness.',
    icon: 'Apple',
    imageUrl: null,
    imageAlt: 'Nutrition and Wellness',
    categoryLabel: 'Wellness',
    readTime: '4 min read',
    slug: 'nutrition',
  },
  {
    id: 's7',
    title: 'Newcomer Support',
    description: 'Find settlement support, interpreter services, and healthcare navigation guides.',
    icon: 'Globe',
    imageUrl: null,
    imageAlt: 'Newcomer Support',
    categoryLabel: 'Community',
    readTime: '3 min read',
    slug: 'newcomer-support',
  },
  {
    id: 's8',
    title: 'Youth Health Resources',
    description: 'Explore youth-friendly resources on relationships, consent, and sexual health.',
    icon: 'HeartPulse',
    imageUrl: null,
    imageAlt: 'Youth Health Resources',
    categoryLabel: 'Youth',
    readTime: '4 min read',
    slug: 'youth-health',
  },
  {
    id: 's9',
    title: 'Medication & Pharmacy Help',
    description: 'Understand prescriptions, pharmacy services, vaccines, and medication safety.',
    icon: 'Pill',
    imageUrl: null,
    imageAlt: 'Medication and Pharmacy Help',
    categoryLabel: 'Health',
    readTime: '3 min read',
    slug: 'pharmacy',
  },
  {
    id: 's10',
    title: 'Community Services',
    description: 'Discover food banks, shelters, community centres, and support organizations.',
    icon: 'Users',
    imageUrl: null,
    imageAlt: 'Community Services',
    categoryLabel: 'Community',
    readTime: '3 min read',
    slug: 'community-services',
  },
  {
    id: 's11',
    title: 'Printable Resources',
    description: 'Download healthcare guides, checklists, emergency contacts, and learning sheets.',
    icon: 'FileText',
    imageUrl: null,
    imageAlt: 'Printable Resources',
    categoryLabel: 'Guides',
    readTime: '2 min read',
    slug: 'printable-resources',
  },
  {
    id: 's12',
    title: 'Language & Translation Support',
    description: 'Access multilingual health information and interpretation support.',
    icon: 'Languages',
    imageUrl: null,
    imageAlt: 'Language and Translation Support',
    categoryLabel: 'Language',
    readTime: '3 min read',
    slug: 'language-support',
  },
  {
    id: 's13',
    title: 'Interactive Learning',
    description: 'Watch videos, complete quizzes, and explore interactive health education tools.',
    icon: 'PlayCircle',
    imageUrl: null,
    imageAlt: 'Interactive Learning',
    categoryLabel: 'Learning',
    readTime: '5 min read',
    slug: 'interactive-learning',
  },
]

export default async function ResourcesPage() {
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const globalData = (await fetchResourcesGlobal(locale, language)) || STATIC_RESOURCES_FALLBACK
  const cmsItems = await fetchResourceItems().catch(() => [])
  const resources = cmsItems.length > 0 ? cmsItems : STATIC_RESOURCES
  const primaryCtaHref = normalizeTopicPagePath(
    globalData.ctaHref || STATIC_RESOURCES_FALLBACK.ctaHref,
  )

  return (
    <main className="resources-page">
      <section className="resources-hero">
        <div className="resources-hero-background" aria-hidden="true" />
        <div className="resources-hero-overlay" aria-hidden="true" />

        <div className="resources-container resources-container--hero">
          <div className="resources-hero-inner">
            <div className="resources-hero-copy">
              <span className="resources-badge">
                {globalData.heroBadge || STATIC_RESOURCES_FALLBACK.heroBadge}
              </span>

              <h1 className="resources-hero-title">
                {globalData.title || STATIC_RESOURCES_FALLBACK.title}
              </h1>

              <p className="resources-hero-description">
                {globalData.intro || STATIC_RESOURCES_FALLBACK.intro}
              </p>

              <div className="resources-actions">
                <Link
                  href={localizePath('/topic', locale)}
                  className="resources-button resources-button--solid"
                >
                  {globalData.heroPrimaryLabel || STATIC_RESOURCES_FALLBACK.heroPrimaryLabel}
                </Link>
              </div>
            </div>

            <div className="resources-hero-image-wrap" aria-hidden="true">
              <Image
                src={getStaticMediaURL('hero.jpg')}
                alt=""
                width={900}
                height={600}
                className="resources-hero-img"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <BMICalculator />

      <section className="resources-section">
        <div className="resources-container resources-container--section">
          <div className="resources-section-header">
            <h2 className="resources-section-heading">
              {globalData.browseTitle || STATIC_RESOURCES_FALLBACK.browseTitle}
            </h2>

            <p className="resources-section-description">
              {globalData.browseDescription || STATIC_RESOURCES_FALLBACK.browseDescription}
            </p>
          </div>

          <div className="resources-grid">
            {resources.map((resource) => {
              const Icon = ICON_MAP[resource.icon] ?? Hospital
              const href = localizePath(`/resources/${resource.slug}`, locale)
              const hasCardImage = Boolean(resource.imageUrl)

              return (
                <Link
                  key={resource.id}
                  href={href}
                  className="resource-card resource-card--listing"
                >
                  {hasCardImage ? (
                    <div className="resource-card-media">
                      <Image
                        src={resource.imageUrl as string}
                        alt={resource.imageAlt || resource.title}
                        fill
                        sizes="(min-width: 1280px) 28vw, (min-width: 768px) 46vw, 94vw"
                        className="resource-card-media-image"
                      />
                    </div>
                  ) : (
                    <div className="resource-card-icon">
                      <Icon size={28} />
                    </div>
                  )}

                  <div className="resource-card-content">
                    <p className="resource-card-category">
                      {resource.categoryLabel || 'Community'}
                    </p>

                    <h3 className="resource-card-title">{resource.title}</h3>

                    <p className="resource-card-read-time">{resource.readTime || '3 min read'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="resources-emergency">
        <div className="resources-container resources-container--section">
          <div className="resources-emergency-card">
            <div className="resources-emergency-layout">
              <div className="resources-emergency-copy">
                <h3 className="resources-emergency-title">
                  {globalData.emergencyTitle || STATIC_RESOURCES_FALLBACK.emergencyTitle}
                </h3>

                <p className="resources-emergency-text">
                  {globalData.emergencyDescription ||
                    STATIC_RESOURCES_FALLBACK.emergencyDescription}
                </p>
              </div>

              <div className="resources-emergency-actions">
                <a
                  href={
                    globalData.emergencyPrimaryHref ||
                    STATIC_RESOURCES_FALLBACK.emergencyPrimaryHref
                  }
                  className="resources-call-button"
                >
                  {globalData.emergencyPrimaryLabel ||
                    STATIC_RESOURCES_FALLBACK.emergencyPrimaryLabel}
                </a>

                <a
                  href={
                    globalData.emergencySecondaryHref ||
                    STATIC_RESOURCES_FALLBACK.emergencySecondaryHref
                  }
                  className="resources-secondary-button"
                >
                  {globalData.emergencySecondaryLabel ||
                    STATIC_RESOURCES_FALLBACK.emergencySecondaryLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="resources-cta">
        <div className="resources-container resources-container--section resources-cta-inner">
          <h2 className="resources-cta-title">
            {globalData.ctaTitle || STATIC_RESOURCES_FALLBACK.ctaTitle}
          </h2>

          <p className="resources-cta-text">
            {globalData.ctaDescription || STATIC_RESOURCES_FALLBACK.ctaDescription}
          </p>

          <div className="resources-cta-actions">
            <Link
              href={localizePath(primaryCtaHref, locale)}
              className="resources-cta-button resources-cta-button--primary"
            >
              {globalData.ctaLabel || STATIC_RESOURCES_FALLBACK.ctaLabel}
            </Link>

            <MultilingualSupportMenu
              currentLocale={locale}
              buttonLabel={
                globalData.ctaSecondaryLabel || STATIC_RESOURCES_FALLBACK.ctaSecondaryLabel
              }
            />
          </div>
        </div>
      </section>
    </main>
  )
}

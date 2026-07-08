import type { ElementType } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Eye,
  Globe,
  Handshake,
  Heart,
  Mail,
  Phone,
  Shield,
  Target,
  Users,
} from 'lucide-react'
import { fetchAboutGlobal } from '../_utils/fetchAbout'
import { STATIC_ABOUT_FALLBACK } from '../_utils/staticAboutFallback'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'
import { AboutRevealCard } from './_components/AboutRevealCard'

export const metadata: Metadata = {
  title: 'About Us | HealthBridge',
  description:
    'Learn about HealthBridge: our mission, vision, and commitment to accessible health information for newcomers and immigrants.',
}

const VALUE_ICONS: Record<string, ElementType> = {
  accessibility: Globe,
  equity: Shield,
  empowerment: Heart,
  'cultural responsiveness': Users,
}

const HERO_IMAGE = '/media/Section1-1-1400x747.png'

const heroHighlights = [
  {
    title: 'Inclusive',
    description: 'We serve newcomers, immigrants, youth, and communities.',
    imageSrc: '/community.png',
    imageAlt: 'Community members',
    className: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Culturally Responsive',
    description: 'Our resources are multilingual and culturally relevant.',
    imageSrc: '/stethoscope.png',
    imageAlt: 'Healthcare support',
    className: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Reliable',
    description: 'Evidence-based information you can trust.',
    imageSrc: '/shield.png',
    imageAlt: 'Reliable protection',
    className: 'bg-violet-100 text-violet-700',
  },
]

const impactStats = [
  {
    value: '25,000+',
    label: 'Learners',
    description: 'Empowered with health knowledge',
    imageSrc: '/student.png',
    imageAlt: 'Student learner',
    className: 'bg-blue-100 text-blue-700',
  },
  {
    value: '12+',
    label: 'Languages',
    description: 'Resources available in multiple languages',
    imageSrc: '/earth.png',
    imageAlt: 'Global languages',
    className: 'bg-emerald-100 text-emerald-700',
  },
  {
    value: '150+',
    label: 'Community Partners',
    description: 'Working together across Canada',
    imageSrc: '/team.png',
    imageAlt: 'Community partners',
    className: 'bg-orange-100 text-orange-600',
  },
  {
    value: '500+',
    label: 'Resources & Guides',
    description: 'Reliable, easy-to-understand information',
    imageSrc: '/learner.png',
    imageAlt: 'Learning resources',
    className: 'bg-cyan-100 text-cyan-700',
  },
]

type TeamMember = {
  name: string
  role: string
  bio?: string
  image?: { url?: string; alt?: string } | null
}

const fallbackTeamMembers: TeamMember[] = [
  { name: 'Dr. Aisha Khan', role: 'Medical Advisor' },
  { name: 'Marco Silva', role: 'Health Educator' },
  { name: 'Fatima Ali', role: 'Community Liaison' },
  { name: 'David Chen', role: 'Digital Learning Lead' },
]

export default async function AboutPage() {
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const cmsData = await fetchAboutGlobal(locale, language)

  const data = cmsData || STATIC_ABOUT_FALLBACK
  const values = (
    data.coreValues && data.coreValues.length > 0
      ? data.coreValues
      : STATIC_ABOUT_FALLBACK.coreValues || []
  ).slice(0, 6)
  const teamMembers: TeamMember[] =
    data.teamMembers && data.teamMembers.length > 0
      ? data.teamMembers.slice(0, 4)
      : fallbackTeamMembers

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative isolate flex min-h-[380px] w-full items-start overflow-hidden sm:min-h-[420px] lg:min-h-[460px]">
        <Image
          src={data.heroImage?.url || HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center] sm:object-center lg:object-[72%_center]"
        />

        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-blue-50/95 via-blue-50/70 via-38% to-transparent to-68% dark:from-slate-950/95 dark:via-slate-900/72 dark:to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[35%] bg-gradient-to-l from-blue-900/10 to-transparent dark:from-slate-950/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 top-1/2 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-200/35 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-12 pt-7 sm:px-6 sm:pt-8 md:pb-16 md:pt-10 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              About <span className="text-green-600 dark:text-green-400">Health</span>
              <span className="text-blue-600 dark:text-blue-400">Bridge</span>
            </h1>
            <p className="mt-10 max-w-xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
              {data.heroSubtitle}
            </p>
            <div className="mt-5 h-0.5 w-10 rounded-full bg-emerald-500" />

            <div className="mt-20 flex flex-wrap gap-3 sm:mt-24 lg:mt-28">
              <Link
                href={localizePath('/topic', locale)}
                className="inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-green-200/60 transition-colors hover:bg-green-700 dark:bg-green-500 dark:text-slate-950 dark:shadow-none dark:hover:bg-green-400"
              >
                Explore Topics
              </Link>
              <Link
                href={localizePath('/resources', locale)}
                className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200/60 transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:shadow-none dark:hover:bg-blue-400"
              >
                Find Local Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-8 text-center">
          <p className="text-2xl font-bold text-slate-950 dark:text-white">Our Approach</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <AboutRevealCard
            className="rounded-lg border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-900/60 dark:bg-blue-950/30"
            delayMs={50}
          >
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <Image
                  src="/target.png"
                  alt="Mission"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {data.missionTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {data.missionDescription}
                </p>
              </div>
            </div>
          </AboutRevealCard>

          <AboutRevealCard
            className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/25"
            delayMs={180}
          >
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Image
                  src="/opportunity.png"
                  alt="Vision"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {data.visionTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {data.visionDescription}
                </p>
              </div>
            </div>
          </AboutRevealCard>

          <AboutRevealCard
            className="rounded-lg border border-violet-100 bg-violet-50/70 p-6 dark:border-violet-900/60 dark:bg-violet-950/25"
            delayMs={310}
          >
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                <Image
                  src="/value.png"
                  alt="Values"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-violet-700 dark:text-violet-300">
                  Our Values
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {values.map((value, index) => {
                    const IconComponent =
                      VALUE_ICONS[value.title.toLowerCase()] ||
                      [Globe, Handshake, Shield, Heart, Users, CheckCircle2][index % 6]

                    return (
                      <div
                        key={value.title}
                        className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <IconComponent className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
                        <span className="truncate">{value.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </AboutRevealCard>
        </div>

        <div className="mx-auto max-w-3xl py-8 text-center">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            HealthBridge is committed to...
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-950 dark:text-white">
            Making health information accessible, understandable, and culturally responsive for
            everyone in Canada.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
          {heroHighlights.map(({ title, description, imageSrc, imageAlt, className }) => (
            <div key={title} className="flex gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl py-8 text-center">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Our Impact</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Building healthier communities through education and support.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {impactStats.map(({ value, label, description, imageSrc, imageAlt, className }) => (
              <div
                key={label}
                className="flex gap-3 border-slate-200 xl:border-l xl:pl-5 dark:border-slate-700"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${className}`}
                >
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <div>
                  <p className="text-2xl font-extrabold leading-none text-blue-600 dark:text-blue-300">
                    {value}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-3xl py-8 text-center">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Meet Our Team</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-900/60 dark:bg-blue-950/25">
            <p className="mb-6 max-w-3xl text-left text-sm leading-6 text-slate-700 dark:text-slate-300">
              {data.teamDescription}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <div key={member.name} className="text-center">
                  <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-slate-200 dark:from-blue-900 dark:to-slate-800">
                    {member.image?.url ? (
                      <Image
                        src={member.image.url}
                        alt={member.image.alt || member.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-extrabold text-blue-700 dark:text-blue-300">
                        {member.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                    {member.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {member.role ||
                      [
                        'Medical Advisor',
                        'Health Educator',
                        'Community Liaison',
                        'Digital Learning Lead',
                      ][index % 4]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-lg border border-orange-100 bg-orange-50/70 p-6 dark:border-orange-900/60 dark:bg-orange-950/25">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300">
                <Handshake className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-orange-600 dark:text-orange-300">
                  Partner With Us
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  We collaborate with organizations that share our vision for healthier, stronger
                  communities.
                </p>
                <Link
                  href={localizePath('/contact', locale)}
                  className="mt-5 inline-flex rounded-md border border-orange-500 px-4 py-2 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-950/60"
                >
                  Work With Us
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/30">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr_1fr] md:items-center">
            <div>
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">
                We&apos;re here to help
              </h2>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                Have questions or feedback? Our team is ready to support you.
              </p>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-blue-200 md:pl-8 dark:md:border-blue-800">
              <Phone className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              <div>
                <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                  1-888-315-9257
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">24/7 | 150+ languages</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-blue-200 md:pl-8 dark:md:border-blue-800">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              <div>
                <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                  info@healthbridge.ca
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We usually respond within 1 business day
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

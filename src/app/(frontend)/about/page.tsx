import type { ElementType } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  GraduationCap,
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
    icon: Users,
    className: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Culturally Responsive',
    description: 'Our resources are multilingual and culturally relevant.',
    icon: Globe,
    className: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Reliable',
    description: 'Evidence-based information you can trust.',
    icon: Shield,
    className: 'bg-violet-100 text-violet-700',
  },
]

const impactStats = [
  {
    value: '25,000+',
    label: 'Learners',
    description: 'Empowered with health knowledge',
    icon: GraduationCap,
    className: 'bg-blue-100 text-blue-700',
  },
  {
    value: '12+',
    label: 'Languages',
    description: 'Resources available in multiple languages',
    icon: Globe,
    className: 'bg-emerald-100 text-emerald-700',
  },
  {
    value: '150+',
    label: 'Community Partners',
    description: 'Working together across Canada',
    icon: Users,
    className: 'bg-orange-100 text-orange-600',
  },
  {
    value: '500+',
    label: 'Resources & Guides',
    description: 'Reliable, easy-to-understand information',
    icon: FileText,
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
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-3/5 bg-blue-100/50 [clip-path:polygon(24%_0,100%_0,100%_100%,0_100%)] dark:bg-blue-950/30" />
        <div className="pointer-events-none absolute right-10 top-10 -z-10 h-36 w-36 rounded-full border-[32px] border-blue-200/60 dark:border-blue-900/50" />

        <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              About <span className="text-green-600 dark:text-green-400">Health</span>
              <span className="text-blue-600 dark:text-blue-400">Bridge</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
              {data.heroSubtitle}
            </p>
            <div className="mt-5 h-0.5 w-10 rounded-full bg-emerald-500" />

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {heroHighlights.map(({ title, description, icon: Icon, className }) => (
                <div key={title} className="flex gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${className}`}
                  >
                    <Icon className="h-5 w-5" />
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
          </div>

          <div className="relative min-h-[270px] overflow-hidden rounded-2xl lg:min-h-[360px]">
            <Image
              src={data.heroImage?.url || HERO_IMAGE}
              alt={data.heroImage?.alt || 'Newcomers gathered in Canada'}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/75 via-transparent to-transparent dark:from-slate-950/60" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <Target className="h-8 w-8" />
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
          </article>

          <article className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/25">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Eye className="h-8 w-8" />
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
          </article>

          <article className="rounded-lg border border-violet-100 bg-violet-50/70 p-6 dark:border-violet-900/60 dark:bg-violet-950/25">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                <Users className="h-8 w-8" />
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
          </article>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-6 lg:grid-cols-[1fr_3fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Our Impact</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Building healthier communities through education and support.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {impactStats.map(({ value, label, description, icon: Icon, className }) => (
                <div
                  key={label}
                  className="flex gap-3 border-slate-200 xl:border-l xl:pl-5 dark:border-slate-700"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${className}`}
                  >
                    <Icon className="h-6 w-6" />
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
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-900/60 dark:bg-blue-950/25">
            <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  {data.teamTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {data.teamDescription}
                </p>
                <Link
                  href={localizePath('/contact', locale)}
                  className="mt-5 inline-flex rounded-md border border-blue-600 px-4 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-950/50"
                >
                  Meet Our Team
                </Link>
              </div>

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

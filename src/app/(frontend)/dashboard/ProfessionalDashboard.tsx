'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Apple,
  Bell,
  Bookmark,
  BookOpen,
  BriefcaseMedical,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  Globe2,
  HeartHandshake,
  History,
  Languages,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircleQuestion,
  Microscope,
  Search,
  Share2,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import { personalizeDashboardHeading, type NormalizedDashboardProfile } from './dashboardCms'
import { getDashboardIcon } from './dashboardProfiles'
import { DashboardQuickActions, DashboardSidebar } from './DashboardShared'
import { createClient } from '@/lib/supabase/client'

type Profile = 'healthcare-provider' | 'settlement-worker'
type Props = {
  dashboardProfile?: NormalizedDashboardProfile | null
  firstName: string
  profile: Profile
}
type Item = { label: string; note: string; icon: LucideIcon; href: string }

const topics: Item[] = [
  {
    label: 'Understanding the Health Care System',
    note: 'Clinics, coverage, referrals, and appointments.',
    icon: BriefcaseMedical,
    href: '/topic/healthcare-system',
  },
  {
    label: 'Lab Tests & Medical Reports',
    note: 'Common tests, results, and follow-up steps.',
    icon: Microscope,
    href: '/topic/lab-tests',
  },
  {
    label: 'Nutrition & Healthy Living',
    note: 'Affordable food, recipes, and family nutrition.',
    icon: Apple,
    href: '/topic/nutrition',
  },
  {
    label: 'Mental Health & Wellness',
    note: 'Support for stress, isolation, and wellbeing.',
    icon: HeartHandshake,
    href: '/topic/mental-health',
  },
  {
    label: 'Sexual Health & Youth Education',
    note: 'Inclusive resources on sexual health and rights.',
    icon: HeartHandshake,
    href: '/topic/youth-health',
  },
  {
    label: 'Public Health & Safety',
    note: 'Vaccines, prevention, alerts, and seasonal safety.',
    icon: ShieldCheck,
    href: '/topic/public-health',
  },
  {
    label: 'Newcomer Settlement & Safety',
    note: 'Insurance, services, safety, and community information.',
    icon: UsersRound,
    href: '/resources/community-services',
  },
]

const tools: Item[] = [
  {
    label: 'Health System Explainer',
    note: 'Printable guide',
    icon: MessageCircleQuestion,
    href: '/resources',
  },
  {
    label: 'Appointment Preparation Sheet',
    note: 'Download',
    icon: CalendarDays,
    href: '/resources',
  },
  {
    label: 'Health Card & Insurance Guide',
    note: 'View guide',
    icon: FileText,
    href: '/resources',
  },
  {
    label: 'Service Navigator (Manitoba)',
    note: 'Find services',
    icon: MapPin,
    href: '/resources/healthcare-services',
  },
  { label: 'Interpreter Request Guide', note: 'View guide', icon: Languages, href: '/resources' },
]

function Sidebar({
  dashboardProfile,
  profile,
}: {
  dashboardProfile?: NormalizedDashboardProfile | null
  profile: Profile
}) {
  const people = profile === 'healthcare-provider' ? 'Patients' : 'Clients'
  const navigation = [
    ['Dashboard', LayoutDashboard, '/dashboard'],
    ['My Chats', MessageCircleQuestion, '/dashboard/chats'],
    [people, UsersRound, '#clients'],
    ['Resource Library', FolderOpen, '/resources'],
    ['Health Topics', BriefcaseMedical, '/topic'],
    ['Local Services', MapPin, '/resources/healthcare-services'],
    ['Tools & Calculators', ClipboardList, '/resources'],
    ['Multilingual Materials', Globe2, '/resources'],
    ['Training & Guides', BookOpen, '/resources'],
    ['Community Notices', Bell, '#updates'],
    ['Favorites', Bookmark, '/resources'],
    ['History', History, '/resources'],
  ] as const

  return (
    <aside className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-100 px-5 py-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-auto p-4">
        {(dashboardProfile?.primaryNavigation || []).map(({ label, iconName, href }, index) => {
          const Icon = getDashboardIcon(iconName)
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${index === 0 ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {Icon ? <Icon className="h-5 w-5" /> : null}
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="m-4 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 font-bold">
          <MessageCircleQuestion className="text-teal-600" />
          Need Help?
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Contact the HealthBridge support team.
        </p>
        <Link
          href="/contact"
          className="mt-4 block rounded-lg bg-teal-50 p-2 text-center text-xs font-bold text-teal-700"
        >
          Contact Support
        </Link>
      </div>
    </aside>
  )
}

export function ProfessionalDashboard({ dashboardProfile, firstName, profile }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const logout = async () => {
    const { error } = await createClient().auth.signOut()
    if (!error) window.location.assign('/login')
  }
  const healthcare = profile === 'healthcare-provider'
  const role =
    dashboardProfile?.roleLabel || (healthcare ? 'Healthcare Provider' : 'Settlement Worker')
  const people = healthcare ? 'Patients' : 'Clients'
  const metrics = [
    [healthcare ? '31' : '24', `${people} Supported`, UsersRound, 'text-teal-600'],
    ['18', 'Resources Used', FolderOpen, 'text-blue-600'],
    ['7', 'Saved Resources', Bookmark, 'text-violet-600'],
    [healthcare ? '5' : '3', 'Upcoming Sessions', CalendarDays, 'text-amber-600'],
  ] as const
  const actions: Item[] = [
    {
      label: 'Search Resources',
      note: 'Find health information',
      icon: Search,
      href: '/resources',
    },
    {
      label: healthcare ? 'Add New Patient' : 'Add New Client',
      note: `Create or update a ${healthcare ? 'patient' : 'client'} profile`,
      icon: UserPlus,
      href: '#clients',
    },
    {
      label: 'Share a Resource',
      note: `Email or print for ${people.toLowerCase()}`,
      icon: Share2,
      href: '/resources',
    },
    {
      label: 'Bookmark a Resource',
      note: 'Save for later use',
      icon: Bookmark,
      href: '/resources',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed bottom-0 left-0 top-[84px] z-40 hidden w-64 border-r border-slate-200 md:top-[88px] lg:block">
        <DashboardSidebar dashboardProfile={dashboardProfile} logout={logout} />
      </div>
      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[84px] z-40 md:top-[88px] lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-72">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg p-2"
            >
              <X />
            </button>
            <DashboardSidebar dashboardProfile={dashboardProfile} logout={logout} />
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="flex h-20 items-center border-b border-slate-200 bg-white px-5 lg:px-9">
          <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <div className="ml-auto flex items-center gap-5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {firstName[0]?.toUpperCase()}S
            </span>
            <div className="hidden md:block">
              <p className="text-sm font-bold">{firstName}</p>
              <p className="text-xs text-slate-500">{role}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1450px] p-5 lg:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {personalizeDashboardHeading(dashboardProfile?.heroHeading, firstName)}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {dashboardProfile?.introduction ||
              'Access tools and resources to support the people you serve.'}
          </p>
          <p className="mt-2 text-sm font-bold text-teal-700">{role}</p>
          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold">Explore Content Areas</h2>
                    <p className="text-xs text-slate-500">
                      Quick access to health and settlement resources to support your{' '}
                      {people.toLowerCase()}.
                    </p>
                  </div>
                  <Link href="/topic" className="text-xs font-bold text-blue-700">
                    View all topics →
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {(dashboardProfile?.contentAreas || []).map(
                    ({ id, label, detail: note, iconName, href }) => {
                      const Icon = getDashboardIcon(iconName)
                      return (
                        <Link
                          key={id}
                          href={href}
                          className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                        >
                          {Icon ? <Icon className="h-9 w-9 text-teal-600" /> : null}
                          <h3 className="mt-3 text-sm font-extrabold leading-5">{label}</h3>
                          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{note}</p>
                          <span className="mt-3 flex items-center gap-1 text-xs font-bold text-teal-700">
                            Browse Resources <ChevronRight className="h-3 w-3" />
                          </span>
                        </Link>
                      )
                    },
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <h2 className="text-lg font-extrabold">
                  {healthcare ? 'Patient Care Tools' : 'Client Support Tools'}
                </h2>
                <p className="text-xs text-slate-500">
                  Practical tools to help you assist and guide {people.toLowerCase()}.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {(dashboardProfile?.toolkits || []).map(
                    ({ id, label, detail: note, iconName, href }) => {
                      const Icon = getDashboardIcon(iconName)
                      return (
                        <Link
                          key={id}
                          href={href}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex gap-3">
                            {Icon ? <Icon className="h-6 w-6 shrink-0 text-blue-600" /> : null}
                            <div>
                              <h3 className="text-xs font-bold">{label}</h3>
                              <p className="mt-2 text-[11px] text-slate-500">{note}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    },
                  )}
                </div>
              </section>
            </div>
            <aside className="space-y-5">
              <DashboardQuickActions dashboardProfile={dashboardProfile} />
              <section
                id="updates"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-extrabold">Community & System Updates</h2>
                {(dashboardProfile?.alerts || []).map((alert) => (
                  <Link href={alert.href} key={alert.id} className="block">
                    <Update title={alert.label} text={alert.detail || ''} />
                  </Link>
                ))}
                <Link
                  href="/topic/public-health"
                  className="mt-5 block text-xs font-bold text-blue-700"
                >
                  View all updates →
                </Link>
              </section>
              <section className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
                <h2 className="font-extrabold text-teal-800">Need Professional Support?</h2>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Connect with mental health, crisis, referral, and community services.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 block rounded-lg bg-white p-2 text-center text-xs font-bold text-teal-700"
                >
                  View Support Services
                </Link>
              </section>
            </aside>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white px-8 py-5 text-xs text-slate-500">
          <div className="mx-auto flex max-w-[1450px] flex-wrap justify-between gap-3">
            <span>© 2026 HealthBridge. All rights reserved.</span>
            <div className="flex gap-5">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function Update({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 flex gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-teal-50">
        <Bell className="text-teal-600" />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs leading-5 text-slate-500">{text}</p>
        <small className="text-[10px] text-slate-400">May 2026</small>
      </div>
    </div>
  )
}

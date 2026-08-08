'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  Apple,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CloudSun,
  FileText,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Home,
  Hospital,
  Languages,
  LifeBuoy,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { createClient } from '@/lib/supabase/client'
import { personalizeDashboardHeading, type CmsDashboardProfile } from './dashboardCms'

type DashboardProps = {
  dashboardProfile?: CmsDashboardProfile | null
  firstName: string
}
type NavItem = { href: string; icon: LucideIcon; label: string }
type TopicGroup = {
  accent: string
  description: string
  href: string
  icon: LucideIcon
  title: string
  topics: string[]
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'My Chats', icon: MessageCircle, href: '/dashboard/chats' },
  { label: 'My Learning', icon: BookOpen, href: '/topic' },
  { label: 'My Resources', icon: FileText, href: '/resources' },
  { label: 'Appointments', icon: CalendarDays, href: '/resources/healthcare-services' },
  { label: 'Campus Support', icon: UsersRound, href: '#campus-support' },
  { label: 'Public Health Alerts', icon: Bell, href: '#public-alerts' },
  { label: 'Profile & Settings', icon: Settings, href: '/account' },
]

const topicGroups: TopicGroup[] = [
  {
    title: 'Canadian Health Care System',
    description: 'Know where to go and how to access care in Canada.',
    href: '/topic/healthcare-system',
    icon: Hospital,
    accent: 'bg-blue-50 text-blue-700 border-blue-100',
    topics: [
      'Walk-in clinics',
      'Family doctors',
      'ER vs urgent care',
      'Appointments',
      'Accessing healthcare without a regular doctor',
    ],
  },
  {
    title: 'Lab Tests',
    description: 'Prepare for testing and understand what happens next.',
    href: '/topic/lab-tests',
    icon: FlaskConical,
    accent: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    topics: [
      'Common lab tests',
      'Why tests are ordered',
      'Understanding results',
      'Follow-up steps',
    ],
  },
  {
    title: 'Nutrition & Healthy Living',
    description: 'Eat well while balancing school and a student budget.',
    href: '/topic/nutrition',
    icon: Apple,
    accent: 'bg-amber-50 text-amber-700 border-amber-100',
    topics: [
      'Affordable food choices',
      'Grocery shopping',
      'Food labels',
      'Healthy eating on a student budget',
      'Healthy recipes',
    ],
  },
  {
    title: 'Mental Health',
    description: 'Support for academic pressure, transitions, and belonging.',
    href: '/topic/mental-health',
    icon: HeartHandshake,
    accent: 'bg-violet-50 text-violet-700 border-violet-100',
    topics: [
      'Academic stress',
      'Isolation',
      'Culture shock',
      'Relocation stress',
      'Counselling',
      'Free and low-cost services',
    ],
  },
  {
    title: 'Sexual Health',
    description: 'Inclusive, private information for safer decisions.',
    href: '/topic/youth-health',
    icon: ShieldCheck,
    accent: 'bg-rose-50 text-rose-700 border-rose-100',
    topics: [
      'Consent',
      'Healthy relationships',
      'STI education',
      'STI testing',
      'Contraception',
      'Gender identity and inclusivity',
    ],
  },
  {
    title: 'Public Health',
    description: 'Stay prepared for seasonal and community health concerns.',
    href: '/topic/public-health',
    icon: Syringe,
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    topics: [
      'Vaccinations',
      'Flu season',
      'Cold weather safety',
      'Extreme weather',
      'Communicable diseases',
    ],
  },
  {
    title: 'Settlement & Safety',
    description: 'Coverage, pharmacy access, safety notices, and alerts.',
    href: '/topic/safety-info',
    icon: LifeBuoy,
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    topics: [
      'Student health insurance',
      'Dental and vision coverage',
      'Pharmacy services',
      'Public safety notices',
      'Emergency alerts',
    ],
  },
]

const quickActions = [
  ['Understand Student Health Insurance', ShieldCheck, '/topic/safety-info'],
  ['Find a Campus Health Clinic', Hospital, '/resources/healthcare-services'],
  ['Find a Family Doctor', Stethoscope, '/topic/healthcare-system'],
  ['Prepare for an Appointment', CalendarDays, '/topic/healthcare-system'],
  ['Mental Health & Stress Support', HeartHandshake, '/topic/mental-health'],
] as const

function Sidebar({ logout, loggingOut }: { logout: () => void; loggingOut: boolean }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <Logo />
        <p className="ml-10 mt-1 text-[10px] text-slate-500">Your bridge to better health</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navigation.map(({ href, icon: Icon, label }, index) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              index === 0
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="m-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <GraduationCap className="h-7 w-7 text-blue-700" />
        <p className="mt-2 text-xs font-bold text-blue-950">International Student</p>
        <p className="mt-1 text-[11px] leading-5 text-blue-800">
          This dashboard is personalized for your journey in Canada.
        </p>
        <Link href="/account" className="mt-2 inline-flex text-[11px] font-bold text-blue-700">
          Update profile
        </Link>
      </div>
      <button
        onClick={logout}
        disabled={loggingOut}
        className="mx-4 mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" /> {loggingOut ? 'Logging out…' : 'Log out'}
      </button>
    </div>
  )
}

function TopicCard({ group }: { group: TopicGroup }) {
  const Icon = group.icon
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${group.accent}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-bold text-slate-950">{group.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {group.topics.map((topic) => (
          <li key={topic} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
            {topic}
          </li>
        ))}
      </ul>
      <Link
        href={group.href}
        className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-blue-700"
      >
        Explore topic <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  )
}

export function InternationalStudentDashboard({ dashboardProfile, firstName }: DashboardProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    const { error } = await createClient().auth.signOut()
    if (!error) window.location.assign('/login')
    else setLoggingOut(false)
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-slate-200 lg:block">
        <Sidebar logout={logout} loggingOut={loggingOut} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative h-full w-72 shadow-2xl">
            <Sidebar logout={logout} loggingOut={loggingOut} />
          </aside>
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white p-2 shadow"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-slate-200 p-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <label className="ml-3 hidden max-w-sm flex-1 items-center rounded-xl bg-slate-100 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              aria-label="Search dashboard"
              className="ml-2 w-full bg-transparent text-sm outline-none"
              placeholder="Search health topics and services"
            />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <Languages className="h-4 w-4 text-slate-500" />
            <button aria-label="Notifications" className="relative rounded-full p-2">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 rounded-full bg-red-500 px-1 text-[9px] text-white">
                3
              </span>
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm font-semibold sm:block">Hi, {firstName}</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-5">
              <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-5 py-7 sm:px-7">
                <div className="relative z-10 max-w-xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <GraduationCap className="h-4 w-4" />
                    {dashboardProfile?.roleLabel || 'International Student'}
                  </span>
                  <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">
                    {personalizeDashboardHeading(dashboardProfile?.heroHeading, firstName)}
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    {dashboardProfile?.introduction ||
                      'Your personalized dashboard for living healthy, studying confidently, and navigating healthcare in Canada.'}
                  </p>
                </div>
                <Image
                  src="/student.png"
                  alt=""
                  width={220}
                  height={220}
                  className="absolute right-5 bottom-0 hidden h-[90%] w-auto object-contain opacity-90 md:block"
                />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3 text-sm">
                      <b>Getting Started with Healthcare as an International Student</b>
                      <span className="font-bold text-blue-700">65%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-[65%] rounded-full bg-blue-600" />
                    </div>
                  </div>
                  <Link
                    href="/topic/healthcare-system"
                    className="rounded-xl border border-blue-200 px-4 py-2 text-center text-xs font-bold text-blue-700 hover:bg-blue-50"
                  >
                    Continue learning →
                  </Link>
                </div>
              </section>

              <section>
                <h2 className="text-sm font-extrabold text-slate-950">Quick Actions</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {quickActions.map(([label, Icon, href]) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center text-[11px] font-bold leading-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Icon className="mb-2 h-7 w-7 text-blue-700" />
                      {label}
                      <ChevronRight className="mt-1 h-3 w-3 text-blue-500" />
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                      Health topics for international students
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Practical information selected for student life in Canada.
                    </p>
                  </div>
                  <Link href="/topic" className="hidden text-xs font-bold text-blue-700 sm:inline">
                    View all topics
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {topicGroups.map((group) => (
                    <TopicCard key={group.title} group={group} />
                  ))}
                </div>
              </section>

              <section id="campus-support" className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 font-bold text-slate-950">
                    <UsersRound className="h-5 w-5 text-blue-700" /> Campus & Community Support
                  </h2>
                  <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                    {[
                      'Campus health services',
                      'Language support',
                      'Counselling & wellness',
                      'Sexual health clinic',
                      'International student office',
                      'Community health centres',
                    ].map((item) => (
                      <Link
                        href="/resources"
                        key={item}
                        className="flex items-center gap-2 rounded-lg p-2 hover:bg-blue-50"
                      >
                        <ChevronRight className="h-3 w-3 text-blue-600" />
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 font-bold text-slate-950">
                    <ClipboardList className="h-5 w-5 text-rose-600" /> Toolkits & Documents
                  </h2>
                  <div className="mt-4 space-y-2">
                    {[
                      'Student Health Checklist',
                      'Doctor Visit Preparation Guide',
                      'Health History Toolkit',
                      'Insurance Terms Guide',
                      'Emergency Contact Card',
                    ].map((item) => (
                      <Link
                        href="/resources/printable-resources"
                        key={item}
                        className="flex items-center rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50"
                      >
                        <FileText className="mr-2 h-4 w-4 text-rose-500" />
                        {item}
                        <span className="ml-auto text-blue-600">↓</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row">
                <MessageCircle className="h-12 w-12 text-blue-700" />
                <div className="flex-1">
                  <h2 className="font-extrabold text-blue-950">We’re here to support you.</h2>
                  <p className="mt-1 text-xs text-blue-800">
                    Get help in your language, anytime you need it.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="tel:18555550550"
                    className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-800 shadow-sm"
                  >
                    Call us
                  </a>
                  <Link
                    href="/contact"
                    className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white"
                  >
                    Live chat
                  </Link>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold">Upcoming Reminders</h2>
                  <Link href="#" className="text-[10px] font-bold text-blue-700">
                    View all
                  </Link>
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    ['Annual Health Checkup', 'Jun 20 · 10:00 AM', CalendarDays],
                    ['Flu Shot Reminder', 'Sep 15, 2026', Syringe],
                    ['Insurance Renewal', 'Oct 1, 2026', ShieldCheck],
                    ['Counselling Session', 'May 22 · 2:00 PM', MessageCircle],
                  ].map(([title, detail, Icon]) => {
                    const ReminderIcon = Icon as LucideIcon
                    return (
                      <div
                        key={title as string}
                        className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
                          <ReminderIcon className="h-4 w-4" />
                        </span>
                        <span>
                          <b className="block text-[11px]">{title as string}</b>
                          <small className="text-[10px] text-slate-500">{detail as string}</small>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-emerald-950">
                  <Languages className="h-5 w-5" /> Need help in your language?
                </h2>
                <p className="mt-2 text-xs leading-5 text-emerald-800">
                  Get information and support in multiple languages.
                </p>
                <Link
                  href="/resources/language-support"
                  className="mt-3 block rounded-xl bg-emerald-700 px-3 py-2 text-center text-xs font-bold text-white"
                >
                  Translate this page
                </Link>
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-blue-950">
                  <Phone className="h-5 w-5" /> Quick Contact
                </h2>
                <div className="mt-3 space-y-3 text-xs">
                  <a href="tel:811" className="flex items-center gap-2 font-bold text-blue-800">
                    <Phone className="h-4 w-4" /> Health Links 811
                  </a>
                  <Link href="/contact" className="flex items-center gap-2 font-bold text-blue-800">
                    <MessageCircle className="h-4 w-4" /> Live Chat Support
                  </Link>
                  <Link
                    href="/resources"
                    className="flex items-center gap-2 font-bold text-blue-800"
                  >
                    <MapPin className="h-4 w-4" /> Find Local Services
                  </Link>
                </div>
              </section>

              <section
                id="public-alerts"
                className="rounded-2xl border border-orange-100 bg-orange-50 p-4"
              >
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-orange-950">
                  <AlertTriangle className="h-5 w-5" /> Public Health Alerts
                </h2>
                <div className="mt-3 space-y-3">
                  {[
                    ['Flu Season Reminder', Syringe],
                    ['Air Quality Alert', CloudSun],
                    ['Emergency Updates', Bell],
                  ].map(([label, Icon]) => {
                    const AlertIcon = Icon as LucideIcon
                    return (
                      <Link
                        href="/topic/public-health"
                        key={label as string}
                        className="flex items-center gap-2 text-xs font-semibold text-orange-900"
                      >
                        <AlertIcon className="h-4 w-4" />
                        {label as string}
                      </Link>
                    )
                  })}
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

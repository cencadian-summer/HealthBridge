'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getStaticMediaURL } from '@/utilities/spacesMedia'
import {
  Apple,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  HeartHandshake,
  Home,
  Languages,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/Logo/Logo'
import { createClient } from '@/lib/supabase/client'
import { personalizeDashboardHeading, type CmsDashboardProfile } from './dashboardCms'

type Props = {
  dashboardProfile?: CmsDashboardProfile | null
  firstName: string
  variant?: 'parent' | 'youth'
}
type Item = readonly [string, LucideIcon, string]
const nav: Item[] = [
  ['Dashboard', Home, '/dashboard'],
  ['My Chats', MessageCircle, '/dashboard/chats'],
  ['My Learning', BookOpen, '/topic'],
  ['My Resources', FileText, '/resources'],
  ['Appointments', CalendarDays, '/resources/healthcare-services'],
  ['Community Support', UsersRound, '#support'],
  ['Public Health Alerts', Bell, '#alerts'],
  ['Profile & Settings', Settings, '/account'],
]
const actions: Item[] = [
  ['Find a Family Doctor', Stethoscope, '/topic/healthcare-system'],
  ['Child Immunization Schedule', ShieldCheck, '/topic/public-health'],
  ['Book a Pediatric Appointment', CalendarDays, '/resources/healthcare-services'],
  ['Family Nutrition', Apple, '/topic/nutrition'],
  ['Mental Health Support', HeartHandshake, '/topic/mental-health'],
  ['Community Support', UsersRound, '/resources/community-services'],
]
const steps = [
  'Apply for Manitoba Health cards',
  'Register children with a family doctor',
  'Review child vaccination schedules',
  'Learn when to use a walk-in clinic vs ER',
  'Find dental and vision services',
  'Download family health guides',
]
const modules: Item[] = [
  ['Canadian Healthcare for Families', Stethoscope, '/topic/healthcare-system'],
  ["Children's Vaccines Explained", ShieldCheck, '/topic/public-health'],
  ['Nutrition for Kids & Families', Apple, '/topic/nutrition'],
  ['Parenting & Mental Wellness', HeartHandshake, '/topic/mental-health'],
  ['Youth Safety & School Health', UsersRound, '/topic/youth-health'],
  ['Public Health Alerts', Bell, '/topic/public-health'],
]
const youthActions: Item[] = [
  ['Mental Health Support', HeartHandshake, '/topic/mental-health'],
  ['Youth Health Rights', ShieldCheck, '/topic/youth-health'],
  ['Sexual Health & Consent', HeartHandshake, '/topic/youth-health'],
  ['Nutrition & Healthy Living', Apple, '/topic/nutrition'],
  ['Prepare for an Appointment', CalendarDays, '/topic/healthcare-system'],
  ['Ask a Question', MessageCircle, '/contact'],
]
const youthSteps = [
  'Learn how to get confidential health support',
  'Find a youth-friendly clinic',
  'Understand consent and healthy relationships',
  'Explore stress, anxiety, and school support',
  'Learn when to call 911 or Health Links 811',
  'Download youth wellness guides',
]
const youthModules: Item[] = [
  ['Mental Health for Teens', HeartHandshake, '/topic/mental-health'],
  ['Youth Safety & Online Wellbeing', ShieldCheck, '/topic/youth-health'],
  ['Sexual Health & Wellness', HeartHandshake, '/topic/youth-health'],
  ['Nutrition for Teens', Apple, '/topic/nutrition'],
  ['Public Health Alerts', Bell, '/topic/public-health'],
  ['School Stress & Study Balance', BookOpen, '/topic/mental-health'],
]

function Card({ children, id, title }: { children: React.ReactNode; id?: string; title: string }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <h2 className="text-sm font-extrabold text-slate-950">{title}</h2>
        <Link href="/resources" className="text-[10px] font-bold text-blue-700">
          View all
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}
function Sidebar({ logout, youth }: { logout: () => void; youth: boolean }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-auto px-3 py-5">
        {nav.map(([label, Icon, href], i) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${i === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="m-4 rounded-2xl bg-emerald-50 p-4">
        <UsersRound className="h-7 w-7 text-emerald-700" />
        <b className="mt-2 block text-xs">{youth ? 'Youth / Teen' : 'Parent / Family'}</b>
        <p className="mt-1 text-[11px] text-emerald-800">
          {youth
            ? 'Personalized for youth and teens across Canada.'
            : 'Personalized for your family in Canada.'}
        </p>
      </div>
      <button
        onClick={logout}
        className="mx-4 mb-4 flex gap-2 p-2 text-sm font-semibold text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  )
}

export function ParentFamilyDashboard({ dashboardProfile, firstName, variant = 'parent' }: Props) {
  const [open, setOpen] = useState(false)
  const youth = variant === 'youth'
  const activeActions = youth ? youthActions : actions
  const activeSteps = youth ? youthSteps : steps
  const activeModules = youth ? youthModules : modules
  const logout = async () => {
    const { error } = await createClient().auth.signOut()
    if (!error) window.location.assign('/login')
  }
  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-slate-200 lg:block">
        <Sidebar logout={logout} youth={youth} />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative h-full w-72">
            <Sidebar logout={logout} youth={youth} />
          </aside>
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 sm:px-6">
          <button
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="rounded-lg border p-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <label className="ml-3 hidden max-w-sm flex-1 items-center rounded-xl bg-slate-100 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              aria-label="Search"
              placeholder="Search family health topics"
              className="ml-2 w-full bg-transparent text-sm outline-none"
            />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <Languages className="h-4 w-4" />
            <Bell className="h-5 w-5" />
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 font-bold text-white">
              {firstName[0]?.toUpperCase()}
            </span>
            <b className="hidden text-sm sm:block">Hi, {firstName}</b>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 px-6 py-7">
                <div className="relative z-10 max-w-lg">
                  <span className="inline-flex gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    <UsersRound className="h-4 w-4" />
                    {dashboardProfile?.roleLabel || (youth ? 'Youth / Teen' : 'Parent / Family')}
                  </span>
                  <h1 className="mt-3 text-3xl font-extrabold text-blue-950">
                    {personalizeDashboardHeading(dashboardProfile?.heroHeading, firstName)}
                  </h1>
                  <p className="mt-2 max-w-md text-sm text-slate-600">
                    {dashboardProfile?.introduction ||
                      (youth
                        ? 'Your personalized dashboard for your health, safety, and wellbeing as a teen in Canada.'
                        : 'Your personalized dashboard for your family’s health and wellbeing in Canada.')}
                  </p>
                </div>
                <Image
                  src={getStaticMediaURL(youth ? 'learner.png' : 'community.png')}
                  alt=""
                  width={300}
                  height={220}
                  className="absolute right-3 bottom-0 hidden h-[92%] w-auto object-contain md:block"
                />
              </section>
              <section className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <BookOpen className="h-10 w-10 rounded-full bg-blue-700 p-2 text-white" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <b>
                        {youth
                          ? 'Teen Health Essentials in Canada'
                          : 'Family Health Essentials in Canada'}
                      </b>
                      <b className="text-blue-700">{youth ? '60%' : '70%'}</b>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full bg-blue-600 ${youth ? 'w-[60%]' : 'w-[70%]'}`}
                      />
                    </div>
                  </div>
                  <Link
                    href="/topic/healthcare-system"
                    className="rounded-xl border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700"
                  >
                    Continue learning →
                  </Link>
                </div>
              </section>
              <section>
                <h2 className="text-sm font-extrabold">Quick Actions</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {activeActions.map(([label, Icon, href]) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex min-h-28 flex-col items-center justify-center rounded-2xl border bg-white p-3 text-center text-[11px] font-bold shadow-sm hover:bg-blue-50"
                    >
                      <Icon className="mb-2 h-7 w-7 text-blue-700" />
                      {label}
                      <ChevronRight className="mt-1 h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </section>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Your Next Steps">
                  <div className="divide-y">
                    {activeSteps.map((step, i) => (
                      <Link
                        href="/resources"
                        key={step}
                        className="flex items-center gap-2 py-2 text-[11px]"
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                          {i === activeSteps.length - 1 ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </Card>
                <Card title="Recommended for You">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {activeModules.map(([label, Icon, href]) => (
                      <Link
                        href={href}
                        key={label}
                        className="rounded-xl border p-3 hover:bg-blue-50"
                      >
                        <Icon className="h-6 w-6 text-blue-700" />
                        <b className="mt-2 block text-[10px]">{label}</b>
                      </Link>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card id="support" title="Family & Community Support">
                  {[
                    'Child & Family Services',
                    'Parenting Support Programs',
                    'School Health Resources',
                    'Language Support',
                  ].map((x) => (
                    <Link
                      key={x}
                      href="/resources/community-services"
                      className="flex py-2 text-[11px]"
                    >
                      {x}
                      <ChevronRight className="ml-auto h-3 w-3" />
                    </Link>
                  ))}
                </Card>
                <Card title="Toolkits & Documents">
                  {[
                    'Family Health Checklist',
                    'Child Immunization Record',
                    'Doctor Visit Guide',
                    'Emergency Contact Card',
                  ].map((x) => (
                    <Link
                      key={x}
                      href="/resources/printable-resources"
                      className="flex py-2 text-[11px]"
                    >
                      <FileText className="mr-2 h-4 w-4 text-rose-500" />
                      {x}
                    </Link>
                  ))}
                </Card>
                <Card id="alerts" title="Public Health Alerts">
                  {['Measles Update', 'Flu Season Reminder', 'Heat Safety for Children'].map(
                    (x) => (
                      <Link key={x} href="/topic/public-health" className="flex py-2 text-[11px]">
                        <Bell className="mr-2 h-4 w-4 text-orange-500" />
                        {x}
                      </Link>
                    ),
                  )}
                </Card>
              </div>
              <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <HeartHandshake className="h-10 w-10 text-blue-700" />
                <div className="flex-1">
                  <b className="text-blue-950">
                    {youth ? 'We’re here to support you.' : 'We’re here to support your family.'}
                  </b>
                  <p className="text-xs text-blue-800">Get help in your language, anytime.</p>
                </div>
                <Link
                  href="/contact"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white"
                >
                  Contact support
                </Link>
              </section>
            </div>
            <aside className="space-y-4">
              <Card title="Upcoming Reminders">
                {[
                  'Pediatric Appointment',
                  'Immunization Due',
                  'School Physical',
                  'Dental Check-up',
                ].map((x) => (
                  <div key={x} className="flex items-center gap-2 border-b py-3 text-[11px]">
                    <CalendarDays className="h-4 w-4 text-blue-700" />
                    <b>{x}</b>
                  </div>
                ))}
              </Card>
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <b className="flex gap-2 text-sm text-emerald-950">
                  <Languages className="h-5 w-5" />
                  Need help in your language?
                </b>
                <Link
                  href="/resources/language-support"
                  className="mt-3 block rounded-xl bg-emerald-700 p-2 text-center text-xs font-bold text-white"
                >
                  Translate this page
                </Link>
              </section>
              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <b className="flex gap-2 text-sm text-blue-950">
                  <Phone className="h-5 w-5" />
                  Quick Contact
                </b>
                <div className="mt-3 space-y-3 text-xs font-bold text-blue-800">
                  <a href="tel:811" className="flex gap-2">
                    <Phone className="h-4 w-4" />
                    Health Links 811
                  </a>
                  <Link href="/contact" className="flex gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Live Chat
                  </Link>
                  <Link href="/resources" className="flex gap-2">
                    <MapPin className="h-4 w-4" />
                    Find Local Services
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

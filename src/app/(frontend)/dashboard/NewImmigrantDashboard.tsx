'use client'

import { Logo } from '@/components/Logo/Logo'
import {
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FlaskConical,
  Globe2,
  HeartHandshake,
  Home,
  Hospital,
  Languages,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type DashboardProps = { firstName: string }
type NavItem = { label: string; icon: LucideIcon; href: string; badge?: string }

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'My Learning', icon: BookOpen, href: '/topic' },
  { label: 'Health Journey', icon: HeartHandshake, href: '/topic/healthcare-system' },
  { label: 'Resources', icon: ClipboardCheck, href: '/resources' },
  { label: 'Find Services', icon: MapPin, href: '/resources' },
  { label: 'Community Events', icon: CalendarDays, href: '#events' },
  { label: 'Saved', icon: Bookmark, href: '#saved' },
  { label: 'Notifications', icon: Bell, href: '#notifications', badge: '3' },
]

const accountNavigation: NavItem[] = [
  { label: 'My Profile', icon: UserRound, href: '/account' },
  { label: 'Personalization', icon: SlidersHorizontal, href: '/account' },
  { label: 'Settings', icon: Settings, href: '/account' },
  { label: 'Help & Support', icon: CircleHelp, href: '/contact' },
]

const journey = [
  ['Apply for a Provincial Health Card', true],
  ['Learn how the healthcare system works', true],
  ['Register with a Family Doctor', false],
  ['Find a Walk-in Clinic near you', false],
  ['Understand Emergency vs. Urgent Care', false],
  ['Learn about Lab Tests & Results', false],
] as const

const services = [
  { label: 'Walk-in Clinics', detail: '5 locations nearby', icon: Hospital },
  { label: 'Family Doctors', detail: '12 accepting patients', icon: UserRound },
  { label: 'Hospitals', detail: '3 hospitals nearby', icon: Stethoscope },
  { label: 'Settlement & Community Services', detail: '8 organizations', icon: UsersRound },
]

function Card({
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  id,
}: {
  title: string
  subtitle: string
  icon: LucideIcon
  children: React.ReactNode
  footer?: React.ReactNode
  id?: string
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 px-4 pt-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
      {footer ? <div className="border-t border-slate-100 px-4 py-3">{footer}</div> : null}
    </section>
  )
}

export function NewImmigrantDashboard({ firstName }: DashboardProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    setIsLoggingOut(true)
    const response = await fetch('/api/users/logout', { method: 'POST' })
    if (response.ok) window.location.assign('/login')
    else setIsLoggingOut(false)
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Logo />
        <p className="ml-10 mt-1 text-[10px] text-slate-500">
          Your bridge to better health in Canada
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1">
          {navigation.map(({ label, icon: Icon, href, badge }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${label === 'Dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge ? (
                <span className="ml-auto rounded-full bg-teal-600 px-2 py-0.5 text-xs text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
        <div className="my-4 border-t border-slate-200" />
        <div className="space-y-1">
          {accountNavigation.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-700"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
        <div className="my-4 border-t border-slate-200" />
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Logging out…' : 'Log Out'}
        </button>
      </nav>
      <div className="m-4 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4 text-sm">
        <p className="font-bold text-slate-800">Need immediate help?</p>
        <p className="mt-2 text-xs text-slate-600">If this is an emergency, call 911.</p>
        <Link
          href="/topic/safety-info"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700"
        >
          <Bell className="h-4 w-4" /> View Emergency Info
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f6f9fb] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 lg:block">
        {sidebar}
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 shadow-2xl">{sidebar}</aside>
          <button
            aria-label="Close navigation"
            className="absolute right-4 top-4 rounded-full bg-white p-2 shadow"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg border border-slate-200 p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="hidden items-center gap-2 sm:flex">
              <Globe2 className="h-4 w-4" /> EN
            </span>
            <span className="relative rounded-full p-2">
              <Bell className="h-5 w-5" />
              <b className="absolute right-0 top-0 rounded-full bg-red-500 px-1 text-[9px] text-white">
                3
              </b>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 font-bold text-white">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden font-semibold sm:inline">Welcome, {firstName} 👋</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-4 p-4 sm:p-6">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-7">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('/homehero.png')] bg-cover bg-center opacity-80 md:block" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/10" />
            <div className="relative">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700">
                New immigrant dashboard
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                We’re happy to have you here. Let’s continue your journey to better health in
                Canada.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-slate-900">What would you like help with today?</h2>
            <div className="mt-3 flex flex-col gap-3 xl:flex-row">
              <label className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 px-4 py-3">
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search topics, resources, or ask a question…"
                />
                <Search className="h-5 w-5 text-slate-500" />
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['Find a Family Doctor', UserRound],
                  ['Health Card', CreditCard],
                  ['Walk-in Clinics', Hospital],
                  ['Understand Lab Results', FlaskConical],
                ].map(([label, Icon]) => (
                  <Link
                    key={label as string}
                    href="/topic/healthcare-system"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-teal-300 hover:bg-teal-50"
                  >
                    <Icon className="h-6 w-6 text-teal-600" /> {label as string}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card
              title="Your Health Journey"
              subtitle="Track important steps as you settle in and navigate the Canadian healthcare system."
              icon={HeartHandshake}
              footer={
                <Link
                  className="text-sm font-semibold text-teal-700"
                  href="/topic/healthcare-system"
                >
                  View full checklist →
                </Link>
              }
            >
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {journey.map(([label, done]) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 text-xs">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-400'}`}
                    >
                      {done ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>{label}</span>
                    {done ? (
                      <b className="ml-auto text-[10px] text-teal-600">Completed</b>
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Card
                title="Continue Learning"
                subtitle="Pick up where you left off."
                icon={BookOpen}
                footer={
                  <Link
                    className="text-sm font-semibold text-teal-700"
                    href="/topic/healthcare-system"
                  >
                    Go to My Learning →
                  </Link>
                }
              >
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-bold">Understanding Canadian Healthcare</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-slate-200">
                      <div className="h-full w-3/4 rounded-full bg-teal-600" />
                    </div>
                    <span className="text-xs text-slate-500">75%</span>
                  </div>
                </div>
              </Card>
              <Card
                title="Recommended for You"
                subtitle="Based on your profile and interests."
                icon={Languages}
                footer={
                  <Link className="text-sm font-semibold text-teal-700" href="/resources">
                    See all recommendations →
                  </Link>
                }
              >
                {[
                  'Health Insurance in Canada',
                  'How to Register a Family Doctor',
                  'Walk-in Clinics: What to Know',
                ].map((item) => (
                  <Link
                    key={item}
                    href="/resources"
                    className="flex items-center border-b border-slate-100 py-2 text-xs last:border-0"
                  >
                    {item}
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                ))}
              </Card>
            </div>

            <Card
              title="Find Services Near You"
              subtitle="Services near Winnipeg, MB"
              icon={MapPin}
              footer={
                <Link className="text-sm font-semibold text-teal-700" href="/resources">
                  View all services →
                </Link>
              }
            >
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {services.map(({ label, detail, icon: Icon }) => (
                  <Link key={label} href="/resources" className="flex items-center gap-3 px-3 py-3">
                    <span className="rounded-lg bg-teal-50 p-2 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <b className="block text-xs">{label}</b>
                      <small className="text-slate-500">{detail}</small>
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                ))}
              </div>
            </Card>

            <Card
              id="events"
              title="Upcoming Community Events"
              subtitle="Connect, learn, and stay informed."
              icon={CalendarDays}
              footer={
                <Link className="text-sm font-semibold text-teal-700" href="/resources">
                  View all events →
                </Link>
              }
            >
              {[
                ['MAY 24', 'Health Insurance Workshop', 'Sat, May 24 · 1:00 PM – 3:00 PM'],
                ['MAY 31', 'Newcomer Health Orientation', 'Sat, May 31 · 10:00 AM – 12:00 PM'],
              ].map(([date, title, time]) => (
                <div
                  key={title}
                  className="mb-2 flex gap-3 rounded-xl border border-slate-200 p-3 last:mb-0"
                >
                  <b className="w-12 text-center text-xs text-teal-700">{date}</b>
                  <span>
                    <b className="block text-xs">{title}</b>
                    <small className="text-slate-500">{time}</small>
                  </span>
                  <button className="ml-auto rounded-lg bg-teal-50 px-3 text-xs font-semibold text-teal-700">
                    Register
                  </button>
                </div>
              ))}
            </Card>

            <Card
              id="saved"
              title="Saved Resources"
              subtitle="Your saved articles and guides."
              icon={Bookmark}
              footer={
                <Link className="text-sm font-semibold text-teal-700" href="/resources">
                  Go to Saved Resources →
                </Link>
              }
            >
              {[
                'Nutrition for New Immigrants',
                'Mental Health Support in Canada',
                'Pregnancy Care in Canada',
              ].map((item) => (
                <Link
                  href="/resources"
                  key={item}
                  className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0"
                >
                  <span className="h-10 w-12 rounded-lg bg-gradient-to-br from-amber-100 to-teal-100" />
                  <span>
                    <b className="block text-xs">{item}</b>
                    <small className="text-slate-500">Article</small>
                  </span>
                </Link>
              ))}
            </Card>

            <Card
              id="notifications"
              title="Notifications"
              subtitle="Stay updated with important information."
              icon={Bell}
              footer={
                <Link className="text-sm font-semibold text-teal-700" href="#notifications">
                  View all notifications →
                </Link>
              }
            >
              {[
                ['New resource added', 'Updated guide: Manitoba Health Card', '2h ago'],
                ['Community event', 'Free health fair this weekend in Winnipeg', '1d ago'],
                ['System update', 'Flu vaccines now available in your area', '2d ago'],
              ].map(([title, text, time]) => (
                <div
                  key={title}
                  className="flex gap-3 border-b border-slate-100 py-2 last:border-0"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-600" />
                  <span>
                    <b className="block text-xs">{title}</b>
                    <small className="text-slate-500">{text}</small>
                  </span>
                  <small className="ml-auto whitespace-nowrap text-slate-400">{time}</small>
                </div>
              ))}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

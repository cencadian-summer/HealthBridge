'use client'

import Link from 'next/link'
import { Bell, ChevronRight, LogOut, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { NormalizedDashboardProfile } from './dashboardCms'
import { getDashboardIcon } from './dashboardProfiles'

type SidebarProps = {
  dashboardProfile?: NormalizedDashboardProfile | null
  isLoggingOut?: boolean
  logout: () => void
}

export function DashboardSidebar({ dashboardProfile, isLoggingOut = false, logout }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1">
          {(dashboardProfile?.primaryNavigation || []).map(({ id, label, iconName, href }) => {
            const Icon = getDashboardIcon(iconName)
            return (
              <Link
                key={id}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${label === 'Dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
        {dashboardProfile?.accountNavigation.length ? (
          <div className="my-4 border-t border-slate-200" />
        ) : null}
        <div className="space-y-1">
          {(dashboardProfile?.accountNavigation || []).map(({ id, label, iconName, href }) => {
            const Icon = getDashboardIcon(iconName)
            return (
              <Link
                key={id}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-700"
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{label}</span>
              </Link>
            )
          })}
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
          href="/resources/emergency-help"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700"
        >
          <Bell className="h-4 w-4" /> View Emergency Info
        </Link>
      </div>
    </div>
  )
}

export type DashboardTopicSuggestion = {
  description: string
  href: string
  keywords: string
  label: string
}

export function DashboardQuickActions({
  dashboardProfile,
  topicSuggestions = [],
}: {
  dashboardProfile?: NormalizedDashboardProfile | null
  topicSuggestions?: DashboardTopicSuggestion[]
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const matchingTopics = useMemo(() => {
    const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return []
    return topicSuggestions
      .filter((topic) => {
        const searchable = `${topic.label} ${topic.description} ${topic.keywords}`.toLowerCase()
        return terms.every((term) => searchable.includes(term))
      })
      .slice(0, 6)
  }, [searchQuery, topicSuggestions])

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (matchingTopics[0]) window.location.assign(matchingTopics[0].href)
  }

  if (!dashboardProfile?.quickActions.length) return null
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="relative mb-4">
        <form
          onSubmit={submitSearch}
          className="flex items-center rounded-xl border border-slate-200 px-4 py-3 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder={dashboardProfile.searchPlaceholder || 'Search health topics and services'}
            aria-label="Search health topics"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="dashboard-topic-suggestions"
            aria-expanded={searchOpen && searchQuery.trim().length > 0}
          />
          <button type="submit" aria-label="Open first matching health topic">
            <Search className="h-5 w-5 text-slate-500" />
          </button>
        </form>
        {searchOpen && searchQuery.trim() ? (
          <div
            id="dashboard-topic-suggestions"
            role="listbox"
            className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            {matchingTopics.length ? (
              matchingTopics.map((topic) => (
                <Link
                  key={topic.href}
                  href={topic.href}
                  role="option"
                  aria-selected="false"
                  onClick={() => setSearchOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-teal-50"
                >
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {topic.label}
                    </span>
                    {topic.description ? (
                      <span className="mt-0.5 line-clamp-1 block text-xs text-slate-500">
                        {topic.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                No matching health topics found.
              </div>
            )}
          </div>
        ) : null}
      </div>
      <h2 className="mb-3 text-sm font-extrabold text-slate-950">Quick Actions</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {dashboardProfile.quickActions.map(({ id, label, href, iconName }) => {
          const Icon = getDashboardIcon(iconName)
          return (
            <Link
              key={id}
              href={href}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:border-teal-300 hover:bg-teal-50"
            >
              {Icon ? <Icon className="h-6 w-6 text-teal-600" /> : null}
              <span>{label}</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

'use client'

import { LogOut } from 'lucide-react'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

type TopicSidebarButtonsProps = {
  items: string[]
  initialActive: string
  sectionAnchors: Array<{
    id: string
    title: string
  }>
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function TopicSidebarButtons({
  items,
  initialActive,
  sectionAnchors,
}: TopicSidebarButtonsProps) {
  const [activeItem, setActiveItem] = useState(initialActive)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.assign('/login')
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to log out.')
      setIsLoggingOut(false)
    }
  }

  const scrollToMatchingSection = (itemLabel: string) => {
    const normalizedItem = normalize(itemLabel)

    const exactMatch = sectionAnchors.find((section) => normalize(section.title) === normalizedItem)

    const partialMatch =
      exactMatch ||
      sectionAnchors.find((section) => {
        const normalizedTitle = normalize(section.title)
        return normalizedTitle.includes(normalizedItem) || normalizedItem.includes(normalizedTitle)
      })

    if (!partialMatch) return

    const target = document.getElementById(partialMatch.id)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mt-4 space-y-1.5">
      {items.map((item) => {
        const isActive = item === activeItem

        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              setActiveItem(item)
              scrollToMatchingSection(item)
            }}
            aria-pressed={isActive}
            className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold leading-tight transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-slate-700'
            }`}
          >
            {item}
          </button>
        )
      })}
      <div className="mt-5 border-t border-slate-200 pt-5">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          {isLoggingOut ? 'Logging out?' : 'Log out'}
        </button>
        {logoutError ? <p role="alert">{logoutError}</p> : null}
      </div>
    </div>
  )
}

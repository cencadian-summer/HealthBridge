'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { localizePath, stripLocaleFromPathname } from '@/i18n/routing'
import type { Locale } from '@/i18n/config'
import { getAccountNavigation } from './accountNavigation'

type HeaderNavProps = {
  isSignedIn: boolean
  locale: Locale
  topicMenuItems: Array<{
    slug: string
    label: string
  }>
  resourceMenuItems: Array<{
    slug: string
    label: string
  }>
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isSignedIn,
  locale,
  topicMenuItems,
  resourceMenuItems,
}) => {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [topicOpen, setTopicOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileTopicOpen, setMobileTopicOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const topicRef = useRef<HTMLDivElement>(null)
  const resourcesRef = useRef<HTMLDivElement>(null)
  const activePathname = stripLocaleFromPathname(pathname)

  useEffect(() => {
    setMenuOpen(false)
    setMobileTopicOpen(false)
    setMobileResourcesOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node

      if (topicRef.current && !topicRef.current.contains(target)) {
        setTopicOpen(false)
      }
      if (resourcesRef.current && !resourcesRef.current.contains(target)) {
        setResourcesOpen(false)
      }

      if (menuOpen && navRef.current && !navRef.current.contains(target)) {
        setMenuOpen(false)
        setMobileTopicOpen(false)
        setMobileResourcesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [menuOpen])

  const isTopicActive = activePathname.startsWith('/topic')
  const isResourcesActive = activePathname.startsWith('/resources')
  const isHomeActive = activePathname === '/'
  const isAboutActive = activePathname.startsWith('/about')
  const isContactActive = activePathname.startsWith('/contact')
  const isChatActive = activePathname.startsWith('/chat')
  const {
    href: accountHref,
    label: accountLabel,
    path: accountPath,
  } = getAccountNavigation(isSignedIn, locale)
  const isAccountActive = activePathname.startsWith(accountPath)

  return (
    <nav className="relative flex flex-1 justify-end" ref={navRef}>
      <div className="relative hidden flex-1 items-center justify-center gap-8 pr-28 text-base lg:flex xl:gap-12">
        <Link
          href={localizePath('/', locale)}
          className={`border-b-2 pb-0.5 font-medium transition-colors ${
            isHomeActive
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
          }`}
        >
          Home
        </Link>

        <div ref={topicRef} className="relative">
          <button
            type="button"
            onClick={() => setTopicOpen((prev) => !prev)}
            className={`flex items-center gap-1 border-b-2 pb-0.5 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              isTopicActive
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-slate-300'
            }`}
          >
            Topics
            <svg
              className={`h-4 w-4 transition-transform ${topicOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {topicOpen && (
            <div className="absolute left-0 top-full z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <Link
                href={localizePath('/topic', locale)}
                className="block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700"
                onClick={() => setTopicOpen(false)}
              >
                All Topics →
              </Link>
              <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
              {topicMenuItems.map((topic) => (
                <Link
                  key={topic.slug}
                  href={localizePath(`/topic/${topic.slug}`, locale)}
                  onClick={() => setTopicOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 dark:hover:text-blue-400 ${
                    activePathname === `/topic/${topic.slug}`
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {topic.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div ref={resourcesRef} className="relative">
          <button
            type="button"
            onClick={() => setResourcesOpen((prev) => !prev)}
            className={`flex items-center gap-1 border-b-2 pb-0.5 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              isResourcesActive
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-700 dark:text-slate-300'
            }`}
          >
            Resources
            <svg
              className={`h-4 w-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {resourcesOpen && (
            <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <Link
                href={localizePath('/resources', locale)}
                className="block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700"
                onClick={() => setResourcesOpen(false)}
              >
                All Resources →
              </Link>
              <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
              {resourceMenuItems.map((resource) => (
                <Link
                  key={resource.slug}
                  href={localizePath(`/resources/${resource.slug}`, locale)}
                  onClick={() => setResourcesOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 dark:hover:text-blue-400 ${
                    activePathname === `/resources/${resource.slug}`
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {resource.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href={localizePath('/chat', locale)}
          className={`border-b-2 pb-0.5 font-medium transition-colors ${
            isChatActive
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
          }`}
        >
          AI Assistant
        </Link>

        <Link
          href={localizePath('/about-us', locale)}
          className={`border-b-2 pb-0.5 font-medium transition-colors ${
            isAboutActive
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
          }`}
        >
          About Us
        </Link>

        <Link
          href={localizePath('/contact', locale)}
          className={`border-b-2 pb-0.5 font-medium transition-colors ${
            isContactActive
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
          }`}
        >
          Contact
        </Link>

        <Link
          href={accountHref}
          className={`border-b-2 pb-0.5 font-medium transition-colors ${
            isAccountActive
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
          }`}
        >
          {accountLabel}
        </Link>

        <div className="absolute right-0">
          <LanguageSwitcher locale={locale} />
        </div>
      </div>

      <button
        aria-controls="mobile-nav-panel"
        aria-expanded={menuOpen}
        aria-label="Toggle menu"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
        onClick={() => setMenuOpen((prev) => !prev)}
        type="button"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d={menuOpen ? 'M6 6L18 18M18 6L6 18' : 'M4 7H20M4 12H20M4 17H20'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className="absolute right-0 top-14 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:hidden dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href={localizePath('/', locale)}
              className={`rounded-lg px-3 py-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                isHomeActive
                  ? 'text-blue-600 underline decoration-blue-600 underline-offset-4 dark:text-blue-400 dark:decoration-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => setMobileTopicOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isTopicActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              Topic
              <svg
                className={`h-4 w-4 transition-transform ${mobileTopicOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileTopicOpen && (
              <div className="ml-3 flex flex-col gap-1 border-l-2 border-blue-100 pl-3 dark:border-blue-800">
                <Link
                  href={localizePath('/topic', locale)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700/50"
                >
                  All Topics
                </Link>
                {topicMenuItems.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={localizePath(`/topic/${topic.slug}`, locale)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                      activePathname === `/topic/${topic.slug}`
                        ? 'font-semibold text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {topic.label}
                  </Link>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileResourcesOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isResourcesActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              Resources
              <svg
                className={`h-4 w-4 transition-transform ${mobileResourcesOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileResourcesOpen && (
              <div className="ml-3 flex flex-col gap-1 border-l-2 border-blue-100 pl-3 dark:border-blue-800">
                <Link
                  href={localizePath('/resources', locale)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700/50"
                >
                  All Resources
                </Link>
                {resourceMenuItems.map((resource) => (
                  <Link
                    key={resource.slug}
                    href={localizePath(`/resources/${resource.slug}`, locale)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                      activePathname === `/resources/${resource.slug}`
                        ? 'font-semibold text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {resource.label}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href={localizePath('/chat', locale)}
              className={`rounded-lg px-3 py-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                isChatActive
                  ? 'text-blue-600 underline decoration-blue-600 underline-offset-4 dark:text-blue-400 dark:decoration-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              AI Assistant
            </Link>

            <Link
              href={localizePath('/about-us', locale)}
              className={`rounded-lg px-3 py-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                isAboutActive
                  ? 'text-blue-600 underline decoration-blue-600 underline-offset-4 dark:text-blue-400 dark:decoration-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              About Us
            </Link>

            <Link
              href={localizePath('/contact', locale)}
              className={`rounded-lg px-3 py-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                isContactActive
                  ? 'text-blue-600 underline decoration-blue-600 underline-offset-4 dark:text-blue-400 dark:decoration-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Contact
            </Link>

            <Link
              href={accountHref}
              className={`rounded-lg px-3 py-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                isAccountActive
                  ? 'text-blue-600 underline decoration-blue-600 underline-offset-4 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {accountLabel}
            </Link>

            <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-700">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

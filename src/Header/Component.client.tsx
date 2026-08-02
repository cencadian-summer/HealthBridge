'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { localizePath } from '@/i18n/routing'
import type { Locale } from '@/i18n/config'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

type HeaderClientProps = {
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

export const HeaderClient: React.FC<HeaderClientProps> = ({
  isSignedIn,
  locale,
  topicMenuItems,
  resourceMenuItems,
}) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80"
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="container flex items-center justify-between gap-4 py-4">
          <Link href={localizePath('/', locale)}>
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav
            isSignedIn={isSignedIn}
            locale={locale}
            topicMenuItems={topicMenuItems}
            resourceMenuItems={resourceMenuItems}
          />
        </div>
      </header>

      <div aria-hidden="true" className="h-[84px] md:h-[88px]" />
    </>
  )
}

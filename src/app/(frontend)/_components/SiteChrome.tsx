'use client'

import { stripLocaleFromPathname } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type SiteChromeProps = {
  children: ReactNode
  footer: ReactNode
  header: ReactNode
}

const chromeFreeRoutes = new Set(['/login'])

export function SiteChrome({ children, footer, header }: SiteChromeProps) {
  const pathname = usePathname()
  const activePathname = stripLocaleFromPathname(pathname)

  if (chromeFreeRoutes.has(activePathname)) {
    return children
  }

  if (activePathname === '/dashboard' || activePathname.startsWith('/dashboard/')) {
    return (
      <>
        {header}
        {children}
      </>
    )
  }

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  )
}

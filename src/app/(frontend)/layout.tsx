import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getRequestLocale } from '@/i18n/server'
import { SiteChrome } from './_components/SiteChrome'
import { getStaticMediaURL } from '@/utilities/spacesMedia'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href={getStaticMediaURL('favicon.svg')} rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <InitTheme />
        <Providers>
          <SiteChrome footer={<Footer />} header={<Header />}>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}

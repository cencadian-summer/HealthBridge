import { getCachedGlobal } from '@/utilities/getGlobals'
import { getRequestLanguage, getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const locale = await getRequestLocale()
  const language = await getRequestLanguage()
  const footerData = await getCachedGlobal('footer', 1, locale, language)()

  const navItems = footerData?.navItems || []
  const additionalLinks = navItems.slice(0, 6)
  const year = new Date().getFullYear()

  return (
    <>
      <section className="relative isolate overflow-hidden border-t border-slate-200 dark:border-slate-800">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-top"
          style={{ backgroundImage: "url('/media/familyDoctor-1.jpeg')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-green-950/60 backdrop-brightness-75"
          aria-hidden="true"
        />

        <div className="container py-16 md:py-20">
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Subscribe to our newsletter
            </h2>
            <form className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-3xl" action="#">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="email@address.com"
                className="h-14 w-full rounded-lg border border-green-100 bg-white px-4 text-base text-slate-800 outline-none ring-green-500 placeholder:text-slate-500 focus:ring-2"
              />
              <button
                type="submit"
                className="h-14 rounded-lg bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-100 dark:border-slate-800">
        <div className="container py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <Link className="inline-flex items-center" href={localizePath('/', locale)}>
                <Logo />
              </Link>
              <p className="max-w-xs text-sm leading-6 text-slate-300">
                Trusted, multilingual guidance for newcomers navigating healthcare and safety in
                Canada.
              </p>
              <p className="text-xs text-slate-400">
                Built for clear, culturally aware health access.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                  Quick Links
                </h3>
                <nav className="flex flex-col gap-2">
                  <Link
                    href={localizePath('/', locale)}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    Home
                  </Link>
                  <Link
                    href={localizePath('/topic', locale)}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    Topics
                  </Link>
                  <Link
                    href={localizePath('/resources', locale)}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    Resources
                  </Link>
                  <Link
                    href={localizePath('/about-us', locale)}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    About Us
                  </Link>
                  <Link
                    href={localizePath('/contact', locale)}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    Contact
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">
                  <Link
                    href={localizePath('/resources', locale)}
                    className="transition-colors hover:text-white"
                  >
                    Resources
                  </Link>
                </h3>
                <nav className="flex flex-col gap-2">
                  {additionalLinks.map(({ link }, i) => {
                    return (
                      <CMSLink
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                        key={`additional-${i}`}
                        locale={locale}
                        {...link}
                      />
                    )
                  })}
                </nav>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                Settings
              </h3>
              <div className="inline-flex rounded-full border border-slate-700 bg-slate-900 p-1">
                <ThemeSelector />
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Need support with topics or content access?</p>
                <Link
                  className="inline-flex text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                  href={localizePath('/topic', locale)}
                >
                  Explore Health Topics
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-400">
            <p>© {year} HealthBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

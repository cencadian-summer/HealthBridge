import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale } from '@/i18n/config'
import { getLocaleFromPathname, localeHeaderName, stripLocaleFromPathname } from '@/i18n/routing'
import { languageHeaderName } from '@/i18n/server'
import { getSupabaseConfig } from '@/lib/supabase/config'

const languageCookieName = 'hb_lang'

const normalizeLanguage = (value: string | null | undefined): string | null => {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return /^[a-z]{2,3}(-[a-z]{2})?$/.test(normalized) ? normalized : null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = getLocaleFromPathname(pathname)
  const queryLanguage = normalizeLanguage(request.nextUrl.searchParams.get('lang'))
  const cookieLanguage = normalizeLanguage(request.cookies.get(languageCookieName)?.value)
  const requestLanguage = queryLanguage ?? cookieLanguage ?? locale
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set(localeHeaderName, locale)
  requestHeaders.set(languageHeaderName, requestLanguage)

  let response: NextResponse

  if (locale === defaultLocale) {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  } else {
    const rewriteURL = request.nextUrl.clone()
    rewriteURL.pathname = stripLocaleFromPathname(pathname)
    response = NextResponse.rewrite(rewriteURL, { request: { headers: requestHeaders } })
  }

  if (queryLanguage) {
    response.cookies.set(languageCookieName, queryLanguage, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  let supabaseConfig: ReturnType<typeof getSupabaseConfig>
  try {
    supabaseConfig = getSupabaseConfig()
  } catch {
    return response
  }

  const { url, key } = supabaseConfig
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  await supabase.auth.getUser()
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}

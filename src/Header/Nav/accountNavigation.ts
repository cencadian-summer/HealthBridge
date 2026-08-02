import type { Locale } from '@/i18n/config'
import { localizePath } from '@/i18n/routing'

export function getAccountNavigation(isSignedIn: boolean, locale: Locale) {
  const path = isSignedIn ? '/account' : '/signup'

  return {
    href: localizePath(path, locale),
    label: isSignedIn ? 'My Account' : 'Sign Up',
    path,
  }
}

import { describe, expect, it } from 'vitest'

import { getAccountNavigation } from '@/Header/Nav/accountNavigation'

describe('navbar Supabase sign-in state', () => {
  it('shows Sign Up for signed-out visitors', () => {
    expect(getAccountNavigation(false, 'en')).toEqual({
      href: '/signup',
      label: 'Sign Up',
      path: '/signup',
    })
  })

  it('shows a localized My Account link for signed-in visitors', () => {
    expect(getAccountNavigation(true, 'fr')).toEqual({
      href: '/fr/account',
      label: 'My Account',
      path: '/account',
    })
  })
})

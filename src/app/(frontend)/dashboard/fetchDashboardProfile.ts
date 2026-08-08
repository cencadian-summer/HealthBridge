import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { DashboardProfile } from '@/payload-types'
import type { Locale } from '@/i18n/config'
import type { Audience } from '@/lib/supabase/userProfile'

export async function fetchDashboardProfile(
  profile: Audience,
  locale: Locale,
): Promise<DashboardProfile | null> {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const result = await payload.find({
      collection: 'dashboard-profiles',
      where: {
        profile: {
          equals: profile,
        },
      },
      locale,
      fallbackLocale: 'en',
      depth: 2,
      limit: 1,
      draft: false,
    })

    return result.docs[0] ?? null
  } catch (error) {
    console.error('Unable to load dashboard profile:', error)
    return null
  }
}

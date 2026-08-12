import configPromise from '@payload-config'
import { defaultLocale, isCmsLocale, type Locale } from '@/i18n/config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { translateContentDeep } from '@/utilities/translateContent'

export type HomepageData = {
  badgeText?: string
  headingStart?: string
  headingHighlight?: string
  headingEnd?: string
  subheading?: string
  footerNote?: string
  canadianBadgeText?: string
  primaryCTALabel?: string
  primaryCTAUrl?: string
  secondaryCTALabel?: string
  secondaryCTAUrl?: string
  holisticHeading?: string
  holisticDescription?: string
  holisticLinkLabel?: string
  holisticLinkUrl?: string
  holisticCards?: Array<{
    id?: string | null
    title: string
    description: string
    imageAlt?: string | null
    image?:
      | string
      | {
          url?: string | null
          alt?: string | null
        }
      | null
  }>
  popularResourcesHeading?: string
  popularResourcesDescription?: string
  popularResourcesViewAllLabel?: string
  popularResourcesViewAllUrl?: string
  popularResources?: Array<{
    id: string
    title: string
    description: string
    href: string
    icon: string
    image?:
      | string
      | {
          url?: string | null
          alt?: string | null
        }
      | null
  }>
}

async function getHomepageGlobal(locale: Locale): Promise<HomepageData | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.findGlobal({
      slug: 'homepage',
      depth: 1,
      locale,
      fallbackLocale: defaultLocale,
    })
    return data as unknown as HomepageData
  } catch {
    return null
  }
}

async function getHomepageForLanguage(
  locale: Locale,
  targetLanguage: string,
): Promise<HomepageData | null> {
  const data = await getHomepageGlobal(locale)

  if (!data) {
    return null
  }

  if (targetLanguage === defaultLocale || isCmsLocale(targetLanguage)) {
    return data
  }

  return translateContentDeep(data, targetLanguage)
}

export const fetchHomepageGlobal = (
  locale: Locale,
  targetLanguage: string = locale,
): Promise<HomepageData | null> =>
  unstable_cache(
    () => getHomepageForLanguage(locale, targetLanguage),
    ['global_homepage', locale, targetLanguage],
    {
      tags: [
        `global_homepage_${locale}`,
        `global_homepage_lang_${targetLanguage}`,
        'global_homepage',
      ],
    },
  )()

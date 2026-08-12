import configPromise from '@payload-config'
import { defaultLocale, isCmsLocale, type Locale } from '@/i18n/config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { translateContentDeep } from '@/utilities/translateContent'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export type PrintableResource = {
  id: string
  title: string
  description?: string
  downloadLabel: string
  file: {
    url: string
    filename?: string
    mimeType?: string
    filesize?: number
    alt?: string
  }
}

export type ResourcesData = {
  heroBadge?: string
  title?: string
  intro?: string
  heroPrimaryLabel?: string
  heroPrimaryHref?: string
  heroSecondaryLabel?: string
  heroSecondaryHref?: string
  browseTitle?: string
  browseDescription?: string
  printableTitle?: string
  printableDescription?: string
  printableResources?: PrintableResource[]
  featuredLinks?: Array<{
    title: string
    description: string
    href: string
    label: string
  }>
  supportCards?: Array<{
    title: string
    bullets?: Array<{ text: string }>
  }>
  ctaTitle?: string
  ctaDescription?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  emergencyTitle?: string
  emergencyDescription?: string
  emergencyPrimaryLabel?: string
  emergencyPrimaryHref?: string
  emergencySecondaryLabel?: string
  emergencySecondaryHref?: string
}

async function getResourcesGlobal(locale: Locale): Promise<ResourcesData | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.findGlobal({
      slug: 'resources',
      depth: 1,
      locale,
      fallbackLocale: defaultLocale,
    })

    const printableResources = Array.isArray(data.printableResources)
      ? data.printableResources.flatMap((item, index) => {
          const file = item.file
          if (!file || typeof file !== 'object' || typeof file.url !== 'string') return []

          return [
            {
              id: typeof item.id === 'string' ? item.id : `printable-${index}`,
              title: typeof item.title === 'string' ? item.title : '',
              description: typeof item.description === 'string' ? item.description : undefined,
              downloadLabel:
                typeof item.downloadLabel === 'string' && item.downloadLabel.trim()
                  ? item.downloadLabel
                  : 'Download guide',
              file: {
                url: getMediaUrl(file.url),
                filename: typeof file.filename === 'string' ? file.filename : undefined,
                mimeType: typeof file.mimeType === 'string' ? file.mimeType : undefined,
                filesize: typeof file.filesize === 'number' ? file.filesize : undefined,
                alt: typeof file.alt === 'string' ? file.alt : undefined,
              },
            },
          ]
        })
      : []

    return {
      ...(data as unknown as ResourcesData),
      printableResources,
    }
  } catch {
    return null
  }
}

async function getResourcesForLanguage(
  locale: Locale,
  targetLanguage: string,
): Promise<ResourcesData | null> {
  const data = await getResourcesGlobal(locale)

  if (!data) {
    return null
  }

  if (targetLanguage === defaultLocale || isCmsLocale(targetLanguage)) {
    return data
  }

  return translateContentDeep(data, targetLanguage)
}

export const fetchResourcesGlobal = (
  locale: Locale,
  targetLanguage: string = locale,
): Promise<ResourcesData | null> =>
  unstable_cache(
    () => getResourcesForLanguage(locale, targetLanguage),
    ['global_resources', locale, targetLanguage],
    {
      tags: [
        `global_resources_${locale}`,
        `global_resources_lang_${targetLanguage}`,
        'global_resources',
        'resources',
      ],
    },
  )()

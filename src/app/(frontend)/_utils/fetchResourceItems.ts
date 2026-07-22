import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export type ResourceItem = {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  imageUrl: string | null
  imageAlt: string
  categoryLabel: string
  readTime: string
  order?: number | null
}

const fetchResourceItemsRaw = async (): Promise<ResourceItem[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'resource-items',
    limit: 100,
    sort: 'order',
    depth: 1,
  })

  return result.docs.map((doc) => ({
    // Reuse the existing hero image as optional card media on the resources grid.
    // If no image exists, the UI falls back to the icon.
    id: String(doc.id),
    title: typeof doc.title === 'string' ? doc.title : '',
    slug: typeof doc.slug === 'string' ? doc.slug : '',
    description: typeof doc.description === 'string' ? doc.description : '',
    icon: typeof doc.icon === 'string' ? doc.icon : 'Hospital',
    categoryLabel: typeof doc.categoryLabel === 'string' ? doc.categoryLabel : 'Community',
    readTime: typeof doc.readTime === 'string' ? doc.readTime : '3 min read',
    imageUrl:
      doc.heroImage && typeof doc.heroImage === 'object' && typeof doc.heroImage.url === 'string'
        ? getMediaUrl(doc.heroImage.url)
        : null,
    imageAlt:
      doc.heroImage && typeof doc.heroImage === 'object' && typeof doc.heroImage.alt === 'string'
        ? doc.heroImage.alt
        : typeof doc.title === 'string'
          ? doc.title
          : 'Resource image',
    order: typeof doc.order === 'number' ? doc.order : null,
  }))
}

export const fetchResourceItems = unstable_cache(fetchResourceItemsRaw, ['resource-items'], {
  tags: ['resource-items'],
  revalidate: 3600,
})

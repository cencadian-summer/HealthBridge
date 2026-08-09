import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { getMediaUrl } from './getMediaUrl'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getStaticMediaURL } from './spacesMedia'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  let url = getStaticMediaURL('website-template-OG.webp')

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = getMediaUrl(ogUrl || image.url)
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Payload Website Template'
    : 'Payload Website Template'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}

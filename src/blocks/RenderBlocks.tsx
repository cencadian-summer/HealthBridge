import React, { Fragment, cache } from 'react'

import type { Page } from '@/payload-types'
import type { Locale } from '@/i18n/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ConceptExplainerBlock } from '@/blocks/ConceptExplainer/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { VideoBlock } from '@/blocks/VideoBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  conceptExplainer: ConceptExplainerBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

const fetchMediaById = cache(async (id: string | number) => {
  const payload = await getPayload({ config: configPromise })

  try {
    return await payload.findByID({
      collection: 'media',
      id: String(id),
      depth: 1,
      draft: true,
      overrideAccess: true,
    })
  } catch {
    return null
  }
})

const resolveBlockMedia = async (media: unknown) => {
  if (media && typeof media === 'object') return media
  if (typeof media === 'string' || typeof media === 'number') {
    return fetchMediaById(media)
  }

  return null
}

export const RenderBlocks = async ({
  blocks,
  locale,
}: {
  blocks: Page['layout'][0][]
  locale?: Locale
}) => {
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    const renderedBlocks = await Promise.all(
      blocks.map(async (block, index) => {
        const { blockType } = block
        const blockSpacing = index === 0 ? 'mb-16' : 'my-16'

        if (blockType === 'mediaBlock') {
          const resolvedMedia = await resolveBlockMedia((block as { media?: unknown }).media)

          return (
            <div className={blockSpacing} key={index}>
              <MediaBlock
                {...block}
                media={resolvedMedia as never}
                disableInnerContainer
                className="max-w-5xl mx-auto"
              />
            </div>
          )
        }

        if (blockType === 'videoBlock') {
          const resolvedThumbnail = await resolveBlockMedia(
            (block as { thumbnail?: unknown }).thumbnail,
          )

          return (
            <div className={blockSpacing} key={index}>
              <VideoBlock {...block} thumbnail={resolvedThumbnail as never} />
            </div>
          )
        }

        if (blockType === 'conceptExplainer') {
          const resolvedGraphic = await resolveBlockMedia((block as { graphic?: unknown }).graphic)

          return (
            <div className={blockSpacing} key={index}>
              <ConceptExplainerBlock {...block} graphic={resolvedGraphic as never} />
            </div>
          )
        }

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType]

          if (Block) {
            return (
              <div className={blockSpacing} key={index}>
                {/* @ts-expect-error there may be some mismatch between the expected types here */}
                <Block {...block} disableInnerContainer locale={locale} />
              </div>
            )
          }
        }
        return null
      }),
    )

    return <Fragment>{renderedBlocks}</Fragment>
  }

  return null
}

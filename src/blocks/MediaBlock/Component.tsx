import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    imageFit = 'natural',
    media,
    mediaPosition,
    staticImage,
    writeUp,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const mediaResource = media && typeof media === 'object' ? media : null
  const fallbackMediaUrl = mediaResource?.filename
    ? `/media/${encodeURIComponent(mediaResource.filename)}`
    : ''
  const resolvedMediaUrl = getMediaUrl(mediaResource?.url || fallbackMediaUrl)
  const resolvedMediaResource = mediaResource
    ? {
        ...mediaResource,
        url: resolvedMediaUrl,
      }
    : media

  const isMediaLeft = mediaPosition === 'left'
  const usesFramedImage = imageFit === 'contain' || imageFit === 'cover'
  const hasRenderableMedia = Boolean(staticImage || resolvedMediaUrl)
  const hasWriteUp = Boolean(writeUp)

  if (hasRenderableMedia && hasWriteUp) {
    return (
      <div
        className={cn(
          '',
          {
            container: enableGutter,
          },
          className,
        )}
      >
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-center lg:gap-6">
          <div className={cn('min-w-0', isMediaLeft ? 'lg:order-1' : 'lg:order-2')}>
            {usesFramedImage ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[0.8rem] border border-border bg-white shadow-sm dark:bg-slate-900 lg:aspect-[4/3]">
                <Media
                  htmlElement={null}
                  fill
                  pictureClassName="relative block h-full w-full"
                  imgClassName={cn(
                    imageFit === 'cover' ? 'object-cover' : 'object-contain',
                    imgClassName,
                  )}
                  loading="eager"
                  resource={resolvedMediaResource}
                  src={staticImage}
                />
              </div>
            ) : (
              <Media
                htmlElement={null}
                pictureClassName="block w-full"
                imgClassName={cn(
                  'h-auto w-full rounded-[0.8rem] border border-border shadow-sm',
                  imgClassName,
                )}
                loading="eager"
                resource={resolvedMediaResource}
                src={staticImage}
              />
            )}
          </div>

          <div className={cn('min-w-0', isMediaLeft ? 'lg:order-2' : 'lg:order-1')}>
            <div
              className={cn('prose prose-slate max-w-none dark:prose-invert', {
                container: !disableInnerContainer,
              })}
            >
              <RichText data={writeUp} enableGutter={false} />
            </div>
          </div>
        </div>

        {caption && (
          <div
            className={cn(
              'mt-6',
              {
                container: !disableInnerContainer,
              },
              captionClassName,
            )}
          >
            <RichText data={caption} enableGutter={false} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {hasRenderableMedia &&
        (usesFramedImage ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-[0.8rem] border border-border bg-white shadow-sm dark:bg-slate-900 lg:aspect-[4/3]">
            <Media
              htmlElement={null}
              fill
              pictureClassName="relative block h-full w-full"
              imgClassName={cn(
                imageFit === 'cover' ? 'object-cover' : 'object-contain',
                imgClassName,
              )}
              loading="eager"
              resource={resolvedMediaResource}
              src={staticImage}
            />
          </div>
        ) : (
          <Media
            imgClassName={cn('h-auto w-full rounded-[0.8rem] border border-border', imgClassName)}
            loading="eager"
            resource={resolvedMediaResource}
            src={staticImage}
          />
        ))}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
      {writeUp && (
        <div
          className={cn('mt-6', {
            container: !disableInnerContainer,
          })}
        >
          <RichText data={writeUp} enableGutter={false} />
        </div>
      )}
    </div>
  )
}

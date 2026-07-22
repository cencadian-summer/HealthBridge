import React from 'react'

import type { Page } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      media?: never
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, media, richText }) => {
  const hasMedia = media && typeof media === 'object'

  return (
    <div className="container mt-16">
      <div
        className={
          hasMedia
            ? 'grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:gap-12'
            : 'max-w-[48rem]'
        }
      >
        <div className="min-w-0">
          {children || (richText && <RichText data={richText} enableGutter={false} />)}
        </div>

        {hasMedia ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Media
              fill
              priority
              resource={media}
              pictureClassName="relative block h-full w-full"
              imgClassName="object-cover"
              size="(min-width: 1024px) 520px, 100vw"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

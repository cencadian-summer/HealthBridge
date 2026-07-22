import type { VideoBlock as VideoBlockProps } from '@/payload-types'

import { VideoEmbed } from '@/components/VideoEmbed'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export function VideoBlock({
  caption,
  duration,
  thumbnail,
  thumbnailAlt,
  title,
  videoUrl,
}: VideoBlockProps) {
  const thumbnailData = thumbnail && typeof thumbnail === 'object' ? thumbnail : null
  const thumbnailUrl = getMediaUrl(thumbnailData?.url)

  return (
    <section className="container">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {title}
          </h2>
          {duration ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {duration}
            </span>
          ) : null}
        </div>

        <VideoEmbed
          url={videoUrl}
          title={title}
          posterUrl={thumbnailUrl || undefined}
          posterAlt={thumbnailAlt || thumbnailData?.alt || `${title} video thumbnail`}
        />

        {caption ? (
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{caption}</p>
        ) : null}
      </div>
    </section>
  )
}

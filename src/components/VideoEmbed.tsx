'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'
import { useState } from 'react'

type VideoEmbedProps = {
  url: string
  title: string
  posterUrl?: string
  posterAlt?: string
}

type VideoSource =
  | { kind: 'iframe'; src: string }
  | { kind: 'video'; src: string }
  | { kind: 'invalid' }

function getVideoSource(value: string): VideoSource {
  try {
    const url = new URL(value)

    if (!['http:', 'https:'].includes(url.protocol)) return { kind: 'invalid' }

    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let youtubeID: string | null = null

    if (host === 'youtu.be') {
      youtubeID = url.pathname.split('/').filter(Boolean)[0] || null
    } else if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      if (url.pathname === '/watch') youtubeID = url.searchParams.get('v')
      else youtubeID = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || null
    }

    if (youtubeID && /^[\w-]{6,}$/.test(youtubeID)) {
      return {
        kind: 'iframe',
        src: `https://www.youtube-nocookie.com/embed/${youtubeID}?rel=0`,
      }
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const vimeoID = url.pathname.match(/(?:video\/)?(\d+)/)?.[1]
      if (vimeoID) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeoID}` }
    }

    return { kind: 'video', src: url.toString() }
  } catch {
    return { kind: 'invalid' }
  }
}

export function VideoEmbed({ posterAlt, posterUrl, url, title }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const source = getVideoSource(url)

  if (source.kind === 'invalid') {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        This video URL is not valid. Add a full HTTPS video URL in Payload CMS.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm dark:border-slate-700">
      <div className="relative aspect-video w-full">
        {posterUrl && !isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 z-10 h-full w-full overflow-hidden bg-black text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            aria-label={`Play ${title}`}
          >
            <Image
              src={posterUrl}
              alt={posterAlt || `${title} thumbnail`}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover transition duration-300 group-hover:scale-[1.02] group-hover:opacity-90"
            />
            <span className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
            <span className="absolute top-1/2 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 shadow-xl ring-1 ring-white/40 transition group-hover:scale-105 group-hover:bg-teal-700">
              <Play aria-hidden="true" className="ml-1 h-9 w-9 fill-white" />
            </span>
          </button>
        ) : null}

        {source.kind === 'iframe' ? (
          <iframe
            src={isPlaying ? `${source.src}&autoplay=1` : source.src}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video
            src={source.src}
            title={title}
            className="h-full w-full bg-black object-contain"
            controls
            autoPlay={isPlaying}
            playsInline
            preload="metadata"
          >
            Your browser does not support embedded video playback.
          </video>
        )}
      </div>
    </div>
  )
}

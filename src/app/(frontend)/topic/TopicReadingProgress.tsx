'use client'

import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Section = { id: string; title: string }
type ProgressResponse = { completedSectionIds?: string[] }

export function TopicReadingProgress({
  topicSlug,
  sections,
}: {
  topicSlug: string
  sections: Section[]
}) {
  const [completed, setCompleted] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const storageKey = 'healthbridge:topic-progress:' + topicSlug
  const validIDs = useMemo(() => new Set(sections.map((section) => section.id)), [sections])

  useEffect(() => {
    let localProgress: string[] = []
    try {
      localProgress = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    } catch {
      localProgress = []
    }
    const safeLocalProgress = localProgress.filter((id) => validIDs.has(id))
    const loadLocalProgress = window.setTimeout(
      () => setCompleted((current) => Array.from(new Set([...current, ...safeLocalProgress]))),
      0,
    )

    fetch('/api/topic-progress?topicSlug=' + encodeURIComponent(topicSlug), {
      credentials: 'include',
    })
      .then(async (response) =>
        response.ok ? ((await response.json()) as ProgressResponse) : null,
      )
      .then((data) => {
        if (!data?.completedSectionIds) return
        setCompleted((current) =>
          Array.from(
            new Set([...current, ...data.completedSectionIds!.filter((id) => validIDs.has(id))]),
          ),
        )
      })
      .finally(() => setIsLoaded(true))

    return () => window.clearTimeout(loadLocalProgress)
  }, [storageKey, topicSlug, validIDs])

  useEffect(() => {
    if (!isLoaded) return
    window.localStorage.setItem(storageKey, JSON.stringify(completed))
    const timeout = window.setTimeout(() => {
      void fetch('/api/topic-progress', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug, completedSectionIds: completed }),
      })
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [completed, isLoaded, storageKey, topicSlug])

  useEffect(() => {
    const timers = new Map<string, number>()
    const elements = document.querySelectorAll<HTMLElement>('[data-reading-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.readingSection
          if (!id) return
          if (entry.isIntersecting && !timers.has(id)) {
            timers.set(
              id,
              window.setTimeout(() => {
                setCompleted((current) => (current.includes(id) ? current : [...current, id]))
                timers.delete(id)
              }, 1000),
            )
          } else if (!entry.isIntersecting) {
            const timer = timers.get(id)
            if (timer) window.clearTimeout(timer)
            timers.delete(id)
          }
        })
      },
      { threshold: 0.5 },
    )

    elements.forEach((element) => observer.observe(element))
    return () => {
      observer.disconnect()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const completedCount = completed.filter((id) => validIDs.has(id)).length
  const percentage = sections.length ? Math.round((completedCount / sections.length) * 100) : 0

  return (
    <div className="sticky top-2 z-20 rounded-2xl border border-teal-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-teal-900 dark:bg-slate-900/95">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-teal-600" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            Your topic progress
          </p>
        </div>
        <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
          {completedCount} of {sections.length} sections · {percentage}%
        </p>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        role="progressbar"
        aria-label="Topic reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-[width] duration-500"
          style={{ width: percentage + '%' }}
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        Progress updates automatically as you read each section.
      </p>
    </div>
  )
}

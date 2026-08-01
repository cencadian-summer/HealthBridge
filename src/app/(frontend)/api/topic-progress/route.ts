import { createClient } from '@/lib/supabase/server'

type TopicProgress = {
  topicSlug: string
  completedSectionIds: string[]
  lastReadAt?: string
}

const normalizeSlug = (value: unknown) =>
  typeof value === 'string' && /^[a-z0-9-]{1,120}$/.test(value) ? value : null

const normalizeSectionIDs = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter(
            (id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 120,
          ),
        ),
      ).slice(0, 200)
    : []

const normalizeProgress = (value: unknown): TopicProgress[] =>
  Array.isArray(value)
    ? value
        .map((item): TopicProgress | null => {
          if (!item || typeof item !== 'object') return null
          const record = item as Record<string, unknown>
          const topicSlug = normalizeSlug(record.topicSlug)
          if (!topicSlug) return null
          return {
            topicSlug,
            completedSectionIds: normalizeSectionIDs(record.completedSectionIds),
            lastReadAt: typeof record.lastReadAt === 'string' ? record.lastReadAt : undefined,
          }
        })
        .filter((item): item is TopicProgress => item !== null)
        .slice(0, 100)
    : []

export async function GET(request: Request) {
  const requestedSlug = new URL(request.url).searchParams.get('topicSlug')
  const topicSlug = requestedSlug ? normalizeSlug(requestedSlug) : null
  if (requestedSlug && !topicSlug) {
    return Response.json({ error: 'Invalid topic.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ completedSectionIds: [], topicProgress: [] }, { status: 401 })

  const topicProgress = normalizeProgress(user.user_metadata.topicProgress)
  if (!topicSlug) return Response.json({ topicProgress })

  const progress = topicProgress.find((item) => item.topicSlug === topicSlug)
  return Response.json({ completedSectionIds: progress?.completedSectionIds ?? [] })
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    topicSlug?: unknown
    completedSectionIds?: unknown
  } | null
  const topicSlug = normalizeSlug(body?.topicSlug)
  if (!topicSlug) return Response.json({ error: 'Invalid topic.' }, { status: 400 })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })

  const completedSectionIds = normalizeSectionIDs(body?.completedSectionIds)
  const topicProgress = [
    ...normalizeProgress(user.user_metadata.topicProgress).filter(
      (item) => item.topicSlug !== topicSlug,
    ),
    { topicSlug, completedSectionIds, lastReadAt: new Date().toISOString() },
  ]

  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, topicProgress },
  })
  if (error) return Response.json({ error: 'Unable to save progress.' }, { status: 500 })

  return Response.json({ completedSectionIds })
}

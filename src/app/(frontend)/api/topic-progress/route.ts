import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

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

export async function GET(request: Request) {
  const topicSlug = normalizeSlug(new URL(request.url).searchParams.get('topicSlug'))
  if (!topicSlug) return Response.json({ error: 'Invalid topic.' }, { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return Response.json({ completedSectionIds: [] }, { status: 401 })

  const progress = user.topicProgress?.find((item) => item.topicSlug === topicSlug)
  return Response.json({ completedSectionIds: progress?.completedSectionIds ?? [] })
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    topicSlug?: unknown
    completedSectionIds?: unknown
  } | null
  const topicSlug = normalizeSlug(body?.topicSlug)
  if (!topicSlug) return Response.json({ error: 'Invalid topic.' }, { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })

  const completedSectionIds = normalizeSectionIDs(body?.completedSectionIds)
  const topicProgress = [
    ...(user.topicProgress ?? [])
      .filter((item) => item.topicSlug !== topicSlug)
      .map((item) => ({
        topicSlug: item.topicSlug,
        completedSectionIds: item.completedSectionIds ?? [],
        lastReadAt: item.lastReadAt,
      })),
    { topicSlug, completedSectionIds, lastReadAt: new Date().toISOString() },
  ]

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { topicProgress },
    user,
    overrideAccess: false,
  })

  return Response.json({ completedSectionIds })
}

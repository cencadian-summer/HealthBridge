import { createClient } from '@/lib/supabase/server'
import { deleteOwnedConversation, renameOwnedConversation } from '@/lib/chat/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function authenticatedUserId() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch {
    return null
  }
}

function notFound() {
  return Response.json({ error: 'Conversation not found.' }, { status: 404 })
}

function isMongoID(value: string) {
  return /^[a-f\d]{24}$/i.test(value)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ownerId = await authenticatedUserId()
  if (!ownerId) return Response.json({ error: 'Authentication required.' }, { status: 401 })

  let title: string
  try {
    const body = (await request.json()) as { title?: unknown }
    title = typeof body.title === 'string' ? body.title.replace(/\s+/g, ' ').trim() : ''
  } catch {
    return Response.json({ error: 'A title is required.' }, { status: 400 })
  }
  if (!title || title.length > 80) {
    return Response.json(
      { error: 'The title must be between 1 and 80 characters.' },
      { status: 400 },
    )
  }

  const { id } = await params
  if (!isMongoID(id)) return notFound()
  const conversation = await renameOwnedConversation(ownerId, id, title)
  if (!conversation) return notFound()
  return Response.json({ id: conversation.id, title: conversation.title })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ownerId = await authenticatedUserId()
  if (!ownerId) return Response.json({ error: 'Authentication required.' }, { status: 401 })

  const { id } = await params
  if (!isMongoID(id)) return notFound()
  const deleted = await deleteOwnedConversation(ownerId, id)
  if (!deleted) return notFound()
  return new Response(null, { status: 204 })
}

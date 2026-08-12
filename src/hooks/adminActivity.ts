import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'
import { revalidateTag } from 'next/cache'

type ActivityAction = 'create' | 'update' | 'delete'
type ActivityScope = 'collection' | 'global'

const getActor = (user: unknown): { actor?: string; actorName: string } => {
  const maybeUser = user as { id?: string; name?: string; email?: string } | undefined

  return {
    actor: maybeUser?.id,
    actorName: maybeUser?.name || maybeUser?.email || 'Admin user',
  }
}

const getEntityId = (doc: unknown): string | undefined => {
  const maybeDoc = doc as { id?: string } | undefined
  return maybeDoc?.id
}

const getEntityTitle = (doc: unknown): string | undefined => {
  const maybeDoc = doc as Record<string, unknown> | undefined

  if (!maybeDoc) return undefined

  const candidates = [maybeDoc.title, maybeDoc.name, maybeDoc.slug] as const

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate
    }

    if (candidate && typeof candidate === 'object') {
      for (const value of Object.values(candidate as Record<string, unknown>)) {
        if (typeof value === 'string' && value.trim()) {
          return value
        }
      }
    }
  }

  return undefined
}

const buildSummary = ({
  action,
  entityScope,
  entitySlug,
  entityTitle,
  actorName,
}: {
  action: ActivityAction
  entityScope: ActivityScope
  entitySlug: string
  entityTitle?: string
  actorName: string
}): string => {
  const actionVerb = action === 'create' ? 'created' : action === 'update' ? 'updated' : 'deleted'
  const entityLabel = entityTitle?.trim() || entitySlug
  return `${actorName} ${actionVerb} ${entityScope} ${entityLabel}`
}

const logActivity = async ({
  req,
  action,
  entityScope,
  entitySlug,
  doc,
}: {
  req: PayloadRequest
  action: ActivityAction
  entityScope: ActivityScope
  entitySlug: string
  doc: unknown
}): Promise<void> => {
  if (!req.user) return

  try {
    const actor = getActor(req.user)
    const entityTitle = getEntityTitle(doc)

    await req.payload.create({
      collection: 'admin-activities',
      data: {
        summary: buildSummary({
          action,
          entityScope,
          entitySlug,
          entityTitle,
          actorName: actor.actorName,
        }),
        action,
        entityScope,
        entitySlug,
        entityId: getEntityId(doc),
        entityTitle,
        actor: actor.actor,
        actorName: actor.actorName,
        locale: req.locale,
      },
      req,
    })

    revalidateTag('admin_activity', 'max')
  } catch (error) {
    req.payload.logger.error(
      `Failed to log admin activity for ${entityScope}:${entitySlug} - ${String(error)}`,
    )
  }
}

export const logCollectionAfterChange = (collectionSlug: string): CollectionAfterChangeHook => {
  return async ({ doc, operation, req }) => {
    if (operation === 'create' || operation === 'update') {
      await logActivity({
        req,
        action: operation,
        entityScope: 'collection',
        entitySlug: collectionSlug,
        doc,
      })
    }

    return doc
  }
}

export const logCollectionAfterDelete = (collectionSlug: string): CollectionAfterDeleteHook => {
  return async ({ doc, req }) => {
    await logActivity({
      req,
      action: 'delete',
      entityScope: 'collection',
      entitySlug: collectionSlug,
      doc,
    })

    return doc
  }
}

export const logGlobalAfterChange = (globalSlug: string): GlobalAfterChangeHook => {
  return async ({ doc, req }) => {
    await logActivity({
      req,
      action: 'update',
      entityScope: 'global',
      entitySlug: globalSlug,
      doc,
    })

    return doc
  }
}

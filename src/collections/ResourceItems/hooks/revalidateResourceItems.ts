import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateResourceItems: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating resource items after change: ${doc.slug}`)
  revalidateTag('resource-items', 'max')
  revalidatePath('/resources')
  if (typeof doc.slug === 'string' && doc.slug.length > 0) {
    revalidatePath(`/resources/${doc.slug}`)
  }
  return doc
}

export const revalidateResourceItemsOnDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload },
}) => {
  payload.logger.info(`Revalidating resource items after delete: ${doc.slug}`)
  revalidateTag('resource-items', 'max')
  revalidatePath('/resources')
  if (typeof doc.slug === 'string' && doc.slug.length > 0) {
    revalidatePath(`/resources/${doc.slug}`)
  }
  return doc
}

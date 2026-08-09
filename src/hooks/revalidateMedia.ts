import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const mediaDependentCacheTags = [
  'health-topics',
  'resource-items',
  'global_homepage',
  'global_about',
  'global_resources',
  'global_header',
  'global_footer',
] as const

const invalidateMediaDependentCaches = (): void => {
  for (const tag of mediaDependentCacheTags) {
    revalidateTag(tag, 'max')
  }

  revalidatePath('/', 'layout')
}

export const revalidateMediaAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  invalidateMediaDependentCaches()
  return doc
}

export const revalidateMediaAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  invalidateMediaDependentCaches()
  return doc
}

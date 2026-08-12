'use client'

import { useRowLabel } from '@payloadcms/ui'

export const ArrayRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ name?: string; title?: string }>()
  const label = data?.title || data?.name || `Item ${(rowNumber ?? 0) + 1}`
  return <div>{label}</div>
}

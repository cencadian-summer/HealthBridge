import type { DashboardHeroBlock, DashboardProfile } from '@/payload-types'

import { DashboardHeroComponent, type DashboardHeroFallback } from './Component'

type Props = {
  dashboardProfile?: DashboardProfile | null
  fallback: DashboardHeroFallback
  firstName: string
  layoutVariant: DashboardProfile['layoutVariant']
  profile: DashboardProfile['profile']
}

export const getDashboardHeroBlock = (
  dashboardProfile?: DashboardProfile | null,
): DashboardHeroBlock | null =>
  dashboardProfile?.layout?.find(
    (block): block is DashboardHeroBlock => block.blockType === 'dashboardHero',
  ) || null

export function RenderDashboardHero({ dashboardProfile, ...props }: Props) {
  return (
    <DashboardHeroComponent
      {...props}
      block={getDashboardHeroBlock(dashboardProfile)}
      dashboardProfile={dashboardProfile}
    />
  )
}

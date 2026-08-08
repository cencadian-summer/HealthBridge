import type { CmsDashboardProfile } from './dashboardCms'
import { ParentFamilyDashboard } from './ParentFamilyDashboard'

export function YouthTeenDashboard({
  dashboardProfile,
  firstName,
}: {
  dashboardProfile?: CmsDashboardProfile | null
  firstName: string
}) {
  return (
    <ParentFamilyDashboard
      dashboardProfile={dashboardProfile}
      firstName={firstName}
      variant="youth"
    />
  )
}

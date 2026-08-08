import type { CmsDashboardProfile } from './dashboardCms'
import { ProfessionalDashboard } from './ProfessionalDashboard'

export function SettlementWorkerDashboard({
  dashboardProfile,
  firstName,
}: {
  dashboardProfile?: CmsDashboardProfile | null
  firstName: string
}) {
  return (
    <ProfessionalDashboard
      dashboardProfile={dashboardProfile}
      firstName={firstName}
      profile="settlement-worker"
    />
  )
}

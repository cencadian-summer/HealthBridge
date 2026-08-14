import type { NormalizedDashboardProfile } from './dashboardCms'
import { ProfessionalDashboard } from './ProfessionalDashboard'

export function SettlementWorkerDashboard({
  dashboardProfile,
  firstName,
}: {
  dashboardProfile?: NormalizedDashboardProfile | null
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

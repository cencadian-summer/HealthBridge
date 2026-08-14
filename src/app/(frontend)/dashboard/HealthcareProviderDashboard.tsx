import type { NormalizedDashboardProfile } from './dashboardCms'
import { ProfessionalDashboard } from './ProfessionalDashboard'

export function HealthcareProviderDashboard({
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
      profile="healthcare-provider"
    />
  )
}

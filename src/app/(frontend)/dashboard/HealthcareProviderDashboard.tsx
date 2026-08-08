import type { CmsDashboardProfile } from './dashboardCms'
import { ProfessionalDashboard } from './ProfessionalDashboard'

export function HealthcareProviderDashboard({
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
      profile="healthcare-provider"
    />
  )
}

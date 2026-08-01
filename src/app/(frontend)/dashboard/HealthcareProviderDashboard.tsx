import { ProfessionalDashboard } from './ProfessionalDashboard'

export function HealthcareProviderDashboard({ firstName }: { firstName: string }) {
  return <ProfessionalDashboard firstName={firstName} profile="healthcare-provider" />
}

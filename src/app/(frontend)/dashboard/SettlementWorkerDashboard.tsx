import { ProfessionalDashboard } from './ProfessionalDashboard'

export function SettlementWorkerDashboard({ firstName }: { firstName: string }) {
  return <ProfessionalDashboard firstName={firstName} profile="settlement-worker" />
}

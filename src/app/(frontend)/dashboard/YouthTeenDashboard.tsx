import { ParentFamilyDashboard } from './ParentFamilyDashboard'

export function YouthTeenDashboard({ firstName }: { firstName: string }) {
  return <ParentFamilyDashboard firstName={firstName} variant="youth" />
}

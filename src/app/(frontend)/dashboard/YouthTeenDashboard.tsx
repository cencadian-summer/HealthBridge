import type { NormalizedDashboardProfile } from './dashboardCms'
import type { DashboardTopicSuggestion } from './DashboardShared'
import { ParentFamilyDashboard } from './ParentFamilyDashboard'

export function YouthTeenDashboard({
  dashboardProfile,
  firstName,
  topicSuggestions,
}: {
  dashboardProfile?: NormalizedDashboardProfile | null
  firstName: string
  topicSuggestions?: DashboardTopicSuggestion[]
}) {
  return (
    <ParentFamilyDashboard
      dashboardProfile={dashboardProfile}
      firstName={firstName}
      topicSuggestions={topicSuggestions}
      variant="youth"
    />
  )
}

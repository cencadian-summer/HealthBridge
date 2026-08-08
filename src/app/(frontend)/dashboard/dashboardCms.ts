import type { DashboardProfile } from '@/payload-types'

export type CmsDashboardProfile = DashboardProfile

export function personalizeDashboardHeading(
  heading: string | null | undefined,
  firstName: string,
  fallback = 'Welcome back, {firstName}! 👋',
): string {
  return (heading?.trim() || fallback).replaceAll('{firstName}', firstName)
}

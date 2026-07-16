import type { User } from '@supabase/supabase-js'

export type Audience =
  | 'new-immigrant'
  | 'international-student'
  | 'parent'
  | 'youth'
  | 'refugee'
  | 'healthcare-provider'
  | 'settlement-worker'
  | 'other'

export type UserRole = 'admin' | 'editor' | 'member'

const audienceValues: ReadonlySet<string> = new Set([
  'new-immigrant',
  'international-student',
  'parent',
  'youth',
  'refugee',
  'healthcare-provider',
  'settlement-worker',
  'other',
])

export function getUserAudiences(user: User): Audience[] {
  const value = user.user_metadata.audiences
  return Array.isArray(value)
    ? value.filter((item): item is Audience => typeof item === 'string' && audienceValues.has(item))
    : []
}

export function getUserRole(user: User): UserRole {
  const role = user.app_metadata.role
  return role === 'admin' || role === 'editor' ? role : 'member'
}

export function hasCompletedOnboarding(user: User) {
  return user.user_metadata.onboardingComplete === true
}

export function getUserName(user: User) {
  return typeof user.user_metadata.name === 'string' ? user.user_metadata.name : ''
}

'use client'

import {
  Baby,
  BriefcaseMedical,
  Check,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Luggage,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

const profiles = [
  {
    value: 'new-immigrant',
    label: 'New Immigrant',
    description: 'I am new to Canada and learning about the healthcare system.',
    icon: Luggage,
    color: 'text-teal-600',
    tint: 'bg-teal-50',
  },
  {
    value: 'international-student',
    label: 'International Student',
    description: 'I am studying in Canada and need health information.',
    icon: GraduationCap,
    color: 'text-blue-700',
    tint: 'bg-blue-50',
  },
  {
    value: 'parent',
    label: 'Parent / Family',
    description: 'I want health information for my family and children.',
    icon: Baby,
    color: 'text-violet-600',
    tint: 'bg-violet-50',
  },
  {
    value: 'youth',
    label: 'Youth / Teen',
    description: 'I want information about my health and well-being.',
    icon: HeartHandshake,
    color: 'text-orange-500',
    tint: 'bg-orange-50',
  },
  {
    value: 'refugee',
    label: 'Refugee / Asylum Seeker',
    description: 'I am seeking safety and need support accessing healthcare.',
    icon: HandHeart,
    color: 'text-indigo-600',
    tint: 'bg-indigo-50',
  },
  {
    value: 'healthcare-provider',
    label: 'Healthcare Provider',
    description: 'I am a healthcare professional looking for resources.',
    icon: BriefcaseMedical,
    color: 'text-cyan-700',
    tint: 'bg-cyan-50',
  },
  {
    value: 'settlement-worker',
    label: 'Settlement Worker',
    description: 'I support newcomers and need tools and resources.',
    icon: ShieldCheck,
    color: 'text-blue-600',
    tint: 'bg-sky-50',
  },
  {
    value: 'other',
    label: 'Other / Not Sure',
    description: 'I am not sure which profile fits me best.',
    icon: CircleHelp,
    color: 'text-amber-500',
    tint: 'bg-amber-50',
  },
] as const

type Audience = (typeof profiles)[number]['value']

type ProfileSelectorProps = {
  initialAudiences: string[]
  userId: string
}

export function ProfileSelector({ initialAudiences, userId }: ProfileSelectorProps) {
  const allowed = new Set(profiles.map((profile) => profile.value))
  const [selected, setSelected] = useState<Audience[]>(
    initialAudiences.filter((value): value is Audience => allowed.has(value as Audience)),
  )
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const toggleProfile = (value: Audience) => {
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
    setError('')
  }

  const saveProfiles = async () => {
    if (selected.length === 0) {
      setError('Select at least one profile to continue.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audiences: selected, onboardingComplete: true }),
      })

      if (response.status === 401 || response.status === 403) {
        window.location.assign('/login')
        return
      }
      if (!response.ok) throw new Error('We could not save your profiles. Please try again.')

      window.location.assign('/topic')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'We could not save your profiles.')
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((profile) => {
          const Icon = profile.icon
          const isSelected = selected.includes(profile.value)

          return (
            <button
              aria-pressed={isSelected}
              className={`group relative min-h-52 rounded-2xl border p-5 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/60 shadow-lg shadow-teal-900/10'
                  : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg'
              }`}
              key={profile.value}
              onClick={() => toggleProfile(profile.value)}
              type="button"
            >
              <span
                className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border ${isSelected ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 bg-white'}`}
              >
                {isSelected ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
              </span>
              <span
                className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${profile.tint}`}
              >
                <Icon aria-hidden="true" className={`h-9 w-9 ${profile.color}`} />
              </span>
              <span className="mt-4 block font-bold leading-tight text-slate-950">
                {profile.label}
              </span>
              <span className="mt-2 block text-sm leading-5 text-slate-600">
                {profile.description}
              </span>
            </button>
          )
        })}
      </div>

      {error ? (
        <p className="mt-5 text-center text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mx-auto mt-8 max-w-lg">
        <button
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
          disabled={isSaving}
          onClick={saveProfiles}
          type="button"
        >
          {isSaving ? 'Saving your profiles?' : 'Continue'}
          {!isSaving ? <ChevronRight aria-hidden="true" className="h-5 w-5" /> : null}
        </button>
        <p className="mt-5 text-center text-sm text-slate-600">
          You can change these choices later in your profile.
        </p>
      </div>
    </div>
  )
}

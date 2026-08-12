'use client'

import {
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

const audienceOptions = [
  ['new-immigrant', 'New immigrant'],
  ['international-student', 'International student'],
  ['parent', 'Parent / caregiver'],
  ['youth', 'Youth / teen'],
  ['refugee', 'Refugee / asylum seeker'],
  ['healthcare-provider', 'Healthcare provider'],
  ['settlement-worker', 'Settlement worker'],
  ['other', 'Other / not sure'],
] as const

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [showDateOfBirth, setShowDateOfBirth] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    const confirmPassword = String(form.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError('Use at least 8 characters with a letter, number, and symbol.')
      return
    }

    setIsSubmitting(true)

    try {
      const audience = String(form.get('audience') || '')
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email: String(form.get('email') || '').trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
          data: {
            name: String(form.get('name') || '').trim(),
            dateOfBirth: String(form.get('dateOfBirth') || ''),
            gender: String(form.get('gender') || ''),
            phone: String(form.get('phone') || '').trim(),
            audiences: audience ? [audience] : [],
            onboardingComplete: false,
          },
        },
      })

      if (authError) throw authError
      if (!data.user) throw new Error('We could not create your account.')

      setSuccess('Account created. Check your email to verify it before logging in.')
    } catch (signupError) {
      setError(
        signupError instanceof Error ? signupError.message : 'We could not create your account.',
      )
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-7 text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-teal-700" />
        <h3 className="mt-4 text-2xl font-bold text-slate-950">Check your email</h3>
        <p className="mt-3 leading-7 text-slate-700">{success}</p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800"
          href="/login"
        >
          Go to login
        </Link>
      </div>
    )
  }

  const inputClass =
    'h-13 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-800'

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="signup-name">
          Full name
        </label>
        <div className="relative">
          <UserRound
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="name"
            className={inputClass}
            id="signup-name"
            name="name"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="signup-email">
          Email address
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="email"
            className={inputClass}
            id="signup-email"
            name="email"
            placeholder="Enter your email address"
            required
            type="email"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">We&apos;ll use this to verify your account.</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="signup-password">
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="new-password"
            className={`${inputClass} pr-12`}
            id="signup-password"
            name="password"
            placeholder="Create a password"
            required
            type={showPassword ? 'text' : 'password'}
          />
          <button
            aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          At least 8 characters with a letter, number, and symbol.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="signup-confirm-password">
          Confirm password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="new-password"
            className={inputClass}
            id="signup-confirm-password"
            name="confirmPassword"
            placeholder="Confirm your password"
            required
            type={showPassword ? 'text' : 'password'}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="signup-date">
            Date of birth <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <div className="relative">
            <CalendarDays
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              autoComplete="bday"
              className={`${inputClass} pr-12`}
              id="signup-date"
              max={new Date().toISOString().slice(0, 10)}
              name="dateOfBirth"
              onChange={(event) => {
                const selectedDate = event.target.value
                setDateOfBirth(selectedDate)
                setShowDateOfBirth(!selectedDate)
              }}
              type={dateOfBirth && !showDateOfBirth ? 'password' : 'date'}
              value={dateOfBirth}
            />
            {dateOfBirth ? (
              <button
                aria-label={showDateOfBirth ? 'Hide date of birth' : 'Show date of birth'}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg bg-white text-slate-500 hover:bg-slate-100"
                onClick={() => setShowDateOfBirth((value) => !value)}
                type="button"
              >
                {showDateOfBirth ? (
                  <EyeOff aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Eye aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Hidden after selection. Use the eye button to review or change it.
          </p>
        </div>
        <div>
          <label className={labelClass} htmlFor="signup-gender">
            Gender <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select
            className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            id="signup-gender"
            name="gender"
            defaultValue=""
          >
            <option value="">Select gender</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
            <option value="self-described">Self describe</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="signup-phone">
          Phone number <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <div className="relative">
          <Phone
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="tel"
            className={inputClass}
            id="signup-phone"
            name="phone"
            placeholder="(204) 123-4567"
            type="tel"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="signup-audience">
          I am? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <div className="relative">
          <UsersRound
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <select
            className="h-13 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            defaultValue=""
            id="signup-audience"
            name="audience"
          >
            <option value="">Select the option that best describes you</option>
            {audienceOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          You can select more profiles during onboarding.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
        <input className="mt-1 h-4 w-4 accent-teal-700" name="terms" required type="checkbox" />
        <span>I agree to HealthBridge&apos;s Terms of Use and Privacy Policy.</span>
      </label>

      <button
        className="flex h-13 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Creating account?' : 'Create account'}
      </button>
    </form>
  )
}

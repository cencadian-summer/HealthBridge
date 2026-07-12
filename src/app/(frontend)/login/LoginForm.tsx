'use client'

import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

type LoginResponse = {
  errors?: Array<{ message?: string }>
  message?: string
  user?: { onboardingComplete?: boolean | null }
}
const rememberedEmailKey = 'healthbridge-remembered-email'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberEmail, setRememberEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const savedEmail = window.localStorage.getItem(rememberedEmailKey)
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberEmail(true)
      }
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const result = (await response.json().catch(() => ({}))) as LoginResponse
      if (!response.ok) {
        throw new Error(
          result.errors?.[0]?.message ||
            result.message ||
            'We could not sign you in. Check your email and password.',
        )
      }
      if (rememberEmail) window.localStorage.setItem(rememberedEmailKey, email.trim())
      else window.localStorage.removeItem(rememberedEmailKey)
      window.location.assign(result.user?.onboardingComplete ? '/' : '/onboarding')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'We could not sign you in.')
      setIsSubmitting(false)
    }
  }

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
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800" htmlFor="login-email">
          Email address
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="email"
            className="h-13 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            id="login-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            type="email"
            value={email}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800" htmlFor="login-password">
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="current-password"
            className="h-13 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            id="login-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Eye aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-slate-700">
          <input
            checked={rememberEmail}
            className="h-4 w-4 accent-teal-700"
            onChange={(event) => setRememberEmail(event.target.checked)}
            type="checkbox"
          />
          Remember my email
        </label>
        <Link className="font-semibold text-teal-700 hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <button
        className="flex h-13 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-65"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Signing in?' : 'Log in'}
      </button>
      <p className="text-center text-sm text-slate-700">
        Don&apos;t have an account?{' '}
        <Link className="font-bold text-teal-700 hover:underline" href="/signup">
          Sign up
        </Link>
      </p>
      <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
        <p className="text-xs leading-5 text-slate-700">
          <strong className="block text-slate-900">
            Your health. Your information. Always protected.
          </strong>
          We are committed to your privacy and data security.
        </p>
      </div>
    </form>
  )
}

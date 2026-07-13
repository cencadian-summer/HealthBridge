import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { ProfileSelector } from './ProfileSelector'

export const metadata: Metadata = {
  title: 'Choose your profile | HealthBridge',
  description: 'Select the HealthBridge profiles that best match your information needs.',
}

export default async function OnboardingPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) redirect('/login')
  if (user.onboardingComplete) {
    const hasNewImmigrantProfile = user.audiences?.includes('new-immigrant')
    redirect(hasNewImmigrantProfile ? '/dashboard' : '/')
  }

  const initialAudiences = Array.isArray(user.audiences) ? user.audiences : []

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#eef9fc] px-4 py-10 sm:px-6 lg:py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.16),transparent_25%)]"
      />
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/80 bg-white px-5 py-8 shadow-[0_28px_80px_-30px_rgba(15,72,90,0.3)] sm:px-10 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
            Create your account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Choose your profile
          </h1>
          <p className="mt-3 text-slate-600">
            Choose one or more profiles that describe you. We&apos;ll prioritize health information
            based on your needs.
          </p>
        </div>

        <ol
          aria-label="Account setup progress"
          className="mx-auto my-9 grid max-w-2xl grid-cols-3 text-center text-xs font-semibold text-slate-500"
        >
          <li className="text-slate-400">
            <span className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-teal-800">
              1
            </span>
            Account
          </li>
          <li className="text-teal-800">
            <span className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-white">
              2
            </span>
            Profile
          </li>
          <li>
            <span className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-slate-100">
              3
            </span>
            Personalize
          </li>
        </ol>

        <ProfileSelector initialAudiences={initialAudiences} userId={String(user.id)} />
      </section>
    </main>
  )
}

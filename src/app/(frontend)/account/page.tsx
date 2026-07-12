import { ProfileSelector } from '@/app/(frontend)/onboarding/ProfileSelector'
import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'My account | HealthBridge',
  description: 'Update your HealthBridge profile and information preferences.',
}

export default async function AccountPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) redirect('/login')

  const initialAudiences = Array.isArray(user.audiences) ? user.audiences : []

  return (
    <main className="min-h-screen bg-[#eef9fc] px-4 py-10 sm:px-6 lg:py-16">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/80 bg-white px-5 py-8 shadow-[0_28px_80px_-30px_rgba(15,72,90,0.3)] sm:px-10 sm:py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">My account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Update your profiles
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Choose the profiles you want HealthBridge to use when prioritizing health information.
            You can update these preferences whenever your needs change.
          </p>
        </div>

        <ProfileSelector
          buttonLabel="Save preferences"
          initialAudiences={initialAudiences}
          redirectTo="/"
          userId={String(user.id)}
        />
      </section>
    </main>
  )
}

import { Logo } from '@/components/Logo/Logo'
import type { Metadata } from 'next'
import Link from 'next/link'

import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Log in | HealthBridge',
  description: 'Log in to HealthBridge and continue your personalized health journey.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#edf9fc] px-4 py-10">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">
        <div className="relative hidden min-h-[46rem] overflow-hidden bg-cyan-50 lg:block">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('/homehero.png')] bg-cover bg-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-950/35"
          />
        </div>
        <div className="px-6 py-10 sm:px-12 lg:px-14">
          <Link aria-label="HealthBridge home" href="/">
            <Logo />
          </Link>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Welcome back
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Log in to HealthBridge</h1>
          <p className="mt-4 text-slate-600">Continue your personalized health journey.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}

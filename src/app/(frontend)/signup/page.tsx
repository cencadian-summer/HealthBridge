import { Logo } from '@/components/Logo/Logo'
import { HeartPulse, ShieldCheck, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SignupForm } from './SignupForm'

export const metadata: Metadata = {
  title: 'Create account | HealthBridge',
  description: 'Create your HealthBridge account for personalized health information.',
}

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Your information is secure',
    text: 'We protect your privacy and personal data.',
  },
  {
    icon: HeartPulse,
    title: 'Personalized for you',
    text: 'Get resources and tips that fit your profile and needs.',
  },
  {
    icon: Zap,
    title: 'Always accessible',
    text: 'Access important health information anytime, anywhere.',
  },
]

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#eef9fc] px-4 py-10 sm:px-6 lg:py-16">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_80px_-30px_rgba(15,72,90,0.3)] lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden bg-gradient-to-b from-white to-cyan-50 px-7 py-10 sm:px-12 lg:min-h-[60rem]">
          <Link aria-label="HealthBridge home" href="/">
            <Logo />
          </Link>
          <h1 className="mt-12 text-4xl font-bold leading-tight text-slate-950">
            Create your <span className="text-teal-700">HealthBridge</span> account
          </h1>
          <p className="mt-5 max-w-md leading-7 text-slate-600">
            Join a trusted community and access personalized health information and resources.
          </p>
          <div className="mt-10 space-y-7">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div className="flex gap-4" key={title}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="text-sm leading-6 text-slate-600">
                  <strong className="block text-base text-slate-900">{title}</strong>
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 hidden h-80 bg-[url('/homehero.png')] bg-cover bg-center lg:block"
          />
        </aside>

        <div className="px-6 py-10 sm:px-12 lg:px-16 lg:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Get started</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-950">Sign up</h2>
          <p className="mt-3 text-slate-600">
            Fill in your basic information to create your account.
          </p>
          <SignupForm />
          <p className="mt-7 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link className="font-bold text-teal-700 hover:underline" href="/login">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

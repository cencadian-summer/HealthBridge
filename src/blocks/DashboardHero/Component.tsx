import Image from 'next/image'
import { GraduationCap, UsersRound } from 'lucide-react'

import type { DashboardHeroBlock, DashboardProfile } from '@/payload-types'
import { getStaticMediaURL } from '@/utilities/spacesMedia'

export type DashboardHeroFallback = {
  dashboardLabel: string
  heading?: string
  introduction: string
  roleLabel: string
}

type Props = {
  block?: DashboardHeroBlock | null
  dashboardProfile?: DashboardProfile | null
  fallback: DashboardHeroFallback
  firstName: string
  layoutVariant: DashboardProfile['layoutVariant']
  profile: DashboardProfile['profile']
}

const firstValue = (...values: Array<string | null | undefined>): string =>
  values.find((value) => value?.trim())?.trim() || ''

const personalizeHeading = (heading: string, firstName: string): string =>
  heading.replaceAll('{firstName}', firstName)

export function DashboardHeroComponent({
  block,
  dashboardProfile,
  fallback,
  firstName,
  layoutVariant,
  profile,
}: Props) {
  const dashboardLabel = firstValue(
    block?.dashboardLabel,
    dashboardProfile?.dashboardLabel,
    fallback.dashboardLabel,
  )
  const heading = personalizeHeading(
    firstValue(
      block?.heading,
      dashboardProfile?.heroHeading,
      fallback.heading,
      'Welcome back, {firstName}! 👋',
    ),
    firstName,
  )
  const introduction = firstValue(
    block?.introduction,
    dashboardProfile?.introduction,
    fallback.introduction,
  )
  const roleLabel = firstValue(block?.roleLabel, dashboardProfile?.roleLabel, fallback.roleLabel)

  if (layoutVariant === 'professional') {
    return (
      <section aria-labelledby="dashboard-hero-heading">
        <h1 id="dashboard-hero-heading" className="text-3xl font-extrabold tracking-tight">
          {heading}
        </h1>
        {introduction ? (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{introduction}</p>
        ) : null}
        {roleLabel ? <p className="mt-2 text-sm font-bold text-teal-700">{roleLabel}</p> : null}
      </section>
    )
  }

  if (layoutVariant === 'student') {
    return (
      <section
        className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-5 py-7 sm:px-7"
        aria-labelledby="dashboard-hero-heading"
      >
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            {roleLabel}
          </span>
          <h1
            id="dashboard-hero-heading"
            className="mt-3 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl"
          >
            {heading}
          </h1>
          {introduction ? (
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{introduction}</p>
          ) : null}
        </div>
        <Image
          src={getStaticMediaURL('student.png')}
          alt=""
          width={220}
          height={220}
          className="absolute right-5 bottom-0 hidden h-[90%] w-auto object-contain opacity-90 md:block"
        />
      </section>
    )
  }

  if (layoutVariant === 'family') {
    const isYouth = profile === 'youth'

    return (
      <section
        className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 px-6 py-7"
        aria-labelledby="dashboard-hero-heading"
      >
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            {roleLabel}
          </span>
          <h1 id="dashboard-hero-heading" className="mt-3 text-3xl font-extrabold text-blue-950">
            {heading}
          </h1>
          {introduction ? (
            <p className="mt-2 max-w-md text-sm text-slate-600">{introduction}</p>
          ) : null}
        </div>
        <Image
          src={getStaticMediaURL(isYouth ? 'learner.png' : 'community.png')}
          alt=""
          width={300}
          height={220}
          className="absolute right-3 bottom-0 hidden h-[92%] w-auto object-contain md:block"
        />
      </section>
    )
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-7"
      aria-labelledby="dashboard-hero-heading"
    >
      <div
        className="absolute inset-y-0 right-0 hidden w-1/2 bg-cover bg-center opacity-80 md:block"
        style={{ backgroundImage: `url('${getStaticMediaURL('homehero.png')}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/10" />
      <div className="relative">
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700">
          {dashboardLabel}
        </span>
        {roleLabel ? (
          <small className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {roleLabel}
          </small>
        ) : null}
        <h1
          id="dashboard-hero-heading"
          className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          {heading}
        </h1>
        {introduction ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{introduction}</p>
        ) : null}
      </div>
    </section>
  )
}

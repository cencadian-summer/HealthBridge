import { getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'
import {
  BookOpen,
  CircleHelp,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getStaticMediaURL } from '@/utilities/spacesMedia'
import Link from 'next/link'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | HealthBridge',
  description: 'Contact HealthBridge for support, questions, partnerships, and feedback.',
}

const contactMethods = [
  {
    icon: Mail,
    title: 'Email us',
    detail: 'info@healthbridge.ca',
    note: "We're happy to help.",
    href: 'mailto:info@healthbridge.ca',
  },
  {
    icon: Phone,
    title: 'Call us',
    detail: '1-204-123-4567',
    note: 'Monday to Friday, 9 AM ? 5 PM CT',
    href: 'tel:+12041234567',
  },
  {
    icon: MessageCircle,
    title: 'Live chat',
    detail: 'Chat with our team',
    note: 'Available on weekdays, 9 AM ? 5 PM CT',
    href: '#contact-form',
  },
  {
    icon: MapPin,
    title: 'Mailing address',
    detail: 'HealthBridge',
    note: '123 Wellness Way, Suite 200 ? Winnipeg, MB R3B 3N3 ? Canada',
  },
]

export default async function ContactPage() {
  const locale = await getRequestLocale()

  return (
    <main className="min-h-screen bg-white text-[#08294d]">
      <section className="relative isolate min-h-[31rem] overflow-hidden border-b border-slate-100">
        <Image
          alt=""
          aria-hidden="true"
          className="-z-20 object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={getStaticMediaURL('contact-hero.png')}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-blue-50/98 via-blue-50/90 via-42% to-blue-50/10 to-78% dark:from-slate-950/98 dark:via-slate-900/90 dark:to-slate-950/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[38%] bg-gradient-to-l from-teal-900/10 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-200/35 blur-3xl"
        />
        <div className="relative z-10 mx-auto flex min-h-[31rem] max-w-[1340px] items-center px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 ring-1 ring-teal-100">
              We are here to help
            </span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl">Contact Us</h1>
            <p className="mt-6 text-lg leading-8 text-slate-700">
              Have a question, need support, or want to share feedback? We&apos;re here for you.
              Reach out and our team will get back to you as soon as possible.
            </p>
            <p className="mt-7 flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-teal-700" />
              Your privacy matters. Your information is safe with us.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1340px] gap-7 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:py-14">
        <ContactForm />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-3xl font-bold tracking-tight">Other ways to reach us</h2>
          <div className="mt-6 space-y-4">
            {contactMethods.map(({ detail, href, icon: Icon, note, title }) => {
              const content = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <span>
                    <strong className="block text-base text-slate-950">{title}</strong>
                    <span className="mt-1 block font-semibold text-teal-700">{detail}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{note}</span>
                  </span>
                </>
              )
              const className =
                'flex items-start gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-teal-300 hover:bg-teal-50/30'
              return href ? (
                <a className={className} href={href} key={title}>
                  {content}
                </a>
              ) : (
                <div className={className} key={title}>
                  {content}
                </div>
              )
            })}
          </div>
        </section>
      </section>

      <section className="mx-auto grid max-w-[1340px] gap-7 px-5 pb-16 sm:px-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-[#f5fcfd] to-[#edf9fa] p-7 sm:p-8">
          <h2 className="text-2xl font-bold">Before you contact us?</h2>
          <p className="mt-2 text-slate-600">Find quick answers to common questions.</p>
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Link
              className="flex items-center gap-4 border-b border-slate-200 p-4 hover:bg-teal-50"
              href={localizePath('/resources', locale)}
            >
              <CircleHelp className="h-7 w-7 text-teal-700" />
              <span>
                <strong className="block text-slate-950">Visit our resources</strong>
                <span className="text-sm text-slate-600">Get answers to common questions</span>
              </span>
            </Link>
            <Link
              className="flex items-center gap-4 border-b border-slate-200 p-4 hover:bg-teal-50"
              href={localizePath('/topic', locale)}
            >
              <BookOpen className="h-7 w-7 text-teal-700" />
              <span>
                <strong className="block text-slate-950">Browse health topics</strong>
                <span className="text-sm text-slate-600">Find guides and helpful information</span>
              </span>
            </Link>
            <a className="flex items-center gap-4 p-4 hover:bg-teal-50" href="#contact-form">
              <TriangleAlert className="h-7 w-7 text-teal-700" />
              <span>
                <strong className="block text-slate-950">Report a technical issue</strong>
                <span className="text-sm text-slate-600">
                  Let us know if something is not working
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-[#f6fbfd] to-[#e7f6fa] p-7 sm:p-8">
          <Clock3
            aria-hidden="true"
            className="absolute -bottom-10 -right-8 h-52 w-52 text-cyan-100"
          />
          <div className="relative">
            <h2 className="text-2xl font-bold">Our office hours</h2>
            <p className="mt-2 text-slate-600">We&apos;re here to support you.</p>
            <dl className="mt-7 grid grid-cols-[1fr_auto] gap-x-8 gap-y-5 text-sm">
              <dt>Monday ? Friday</dt>
              <dd className="font-semibold">9:00 AM ? 5:00 PM CT</dd>
              <dt>Saturday</dt>
              <dd className="font-semibold">Closed</dd>
              <dt>Sunday</dt>
              <dd className="font-semibold">Closed</dd>
              <dt>Statutory holidays</dt>
              <dd className="font-semibold">Closed</dd>
            </dl>
          </div>
        </div>
      </section>
    </main>
  )
}

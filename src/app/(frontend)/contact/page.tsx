import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Clock3,
  FileQuestion,
  Globe,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { getRequestLocale } from '@/i18n/server'
import { localizePath } from '@/i18n/routing'

export const metadata: Metadata = {
  title: 'Contact | HealthBridge',
  description:
    'Contact HealthBridge for help with health topics, resources, and newcomer support in Canada.',
}

const contactMethods = [
  {
    title: 'Call Support',
    detail: '1-888-315-9257',
    note: '24/7 support with language assistance',
    icon: Phone,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  {
    title: 'Email Us',
    detail: 'info@healthbridge.ca',
    note: 'Response within 1 business day',
    icon: Mail,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  {
    title: 'Service Area',
    detail: 'Canada-wide',
    note: 'Based in Winnipeg, supporting newcomers nationally',
    icon: MapPin,
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  },
]

const supportTopics = [
  { label: 'Health topic guidance', icon: HeartHandshake },
  { label: 'Resource navigation', icon: FileQuestion },
  { label: 'Multilingual support', icon: Globe },
  { label: 'Safety information', icon: ShieldCheck },
]

export default async function ContactPage() {
  const locale = await getRequestLocale()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-blue-700 ring-1 ring-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:ring-slate-700">
              <MessageCircle className="h-4 w-4" />
              Contact HealthBridge
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              We are here to help you find the right health information.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
              Send a question, request a resource, or tell us what kind of support would make
              healthcare easier to navigate.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {supportTopics.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                >
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {contactMethods.map(({ title, detail, note, icon: Icon, className }) => (
              <article
                key={title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${className}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">
                      {title}
                    </h2>
                    <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                      {detail}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {note}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <form
          action="#"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Send a Message</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Share a few details and our team will follow up.
              </p>
            </div>
            <div className="hidden rounded-full bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 sm:block">
              <Send className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">
                Full Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your name"
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold">
                Topic
              </label>
              <select
                id="contact-topic"
                name="topic"
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a topic
                </option>
                <option>Health topics</option>
                <option>Community resources</option>
                <option>Language support</option>
                <option>Partnerships</option>
                <option>Feedback</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-language" className="mb-2 block text-sm font-semibold">
                Preferred Language
              </label>
              <input
                id="contact-language"
                name="language"
                type="text"
                placeholder="English, French, Hindi..."
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              placeholder="Tell us how we can help."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Submit Message
            </button>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              This sample form is ready for a future form handler or CMS integration.
            </p>
          </div>
        </form>

        <aside className="space-y-5">
          <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/25">
            <div className="flex items-center gap-3">
              <Clock3 className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
              <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                Response Time
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              Email messages are usually answered within 1 business day. Urgent safety concerns
              should use local emergency or crisis services.
            </p>
          </section>

          <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/30">
            <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">Quick Links</h2>
            <div className="mt-4 grid gap-2">
              <Link
                href={localizePath('/resources', locale)}
                className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                Browse Resources
              </Link>
              <Link
                href={localizePath('/topic', locale)}
                className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                Explore Health Topics
              </Link>
              <Link
                href={localizePath('/about-us', locale)}
                className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                Learn About HealthBridge
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}

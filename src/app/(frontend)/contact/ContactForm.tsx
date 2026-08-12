'use client'

import { CheckCircle2, Mail, Send, UserRound } from 'lucide-react'
import { FormEvent, useState } from 'react'

type SubmissionResult = {
  message?: string
  reference?: string
}

const inputClass =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<SubmissionResult | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)

    setError('')
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify({
          consent: form.get('consent') === 'on',
          email: String(form.get('email') || ''),
          message: String(form.get('message') || ''),
          name: String(form.get('name') || ''),
          subject: String(form.get('subject') || ''),
          website: String(form.get('website') || ''),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json().catch(() => ({}))) as SubmissionResult

      if (!response.ok) {
        throw new Error(result.message || 'We could not record your message. Please try again.')
      }

      setSuccess({
        message: result.message || 'Your inquiry has been recorded.',
        reference: result.reference,
      })
      formElement.reset()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'We could not record your message. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      id="contact-form"
      onSubmit={submit}
    >
      <h2 className="text-3xl font-bold tracking-tight">Send us a message</h2>
      <p className="mt-2 text-slate-600">Fill out the form below and we&apos;ll get back to you.</p>

      {success ? (
        <div
          aria-live="polite"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Message received</p>
              <p className="mt-1 text-sm leading-6">{success.message}</p>
              {success.reference ? (
                <p className="mt-2 text-xs font-semibold">Reference: {success.reference}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-7 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="contact-name">
            Full name
          </label>
          <div className="relative">
            <UserRound
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              autoComplete="name"
              className={`${inputClass} pl-12`}
              id="contact-name"
              maxLength={100}
              name="name"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="contact-email">
            Email address
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              autoComplete="email"
              className={`${inputClass} pl-12`}
              id="contact-email"
              maxLength={254}
              name="email"
              placeholder="Enter your email address"
              required
              type="email"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="contact-subject">
            Subject
          </label>
          <select
            className={inputClass}
            defaultValue=""
            id="contact-subject"
            name="subject"
            required
          >
            <option disabled value="">
              Select a subject
            </option>
            <option value="general">General question</option>
            <option value="resource">Resource support</option>
            <option value="technical">Technical issue</option>
            <option value="partnership">Partnership</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="contact-message">
            Message
          </label>
          <textarea
            className="min-h-36 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            id="contact-message"
            maxLength={1000}
            minLength={10}
            name="message"
            placeholder="How can we help you?"
            required
          />
          <p className="mt-1 text-right text-xs text-slate-400">Maximum 1000 characters</p>
        </div>

        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label htmlFor="contact-website">Website</label>
          <input autoComplete="off" id="contact-website" name="website" tabIndex={-1} type="text" />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
          <input className="mt-1 h-4 w-4 accent-teal-700" name="consent" required type="checkbox" />
          <span>I agree to HealthBridge&apos;s Privacy Policy.</span>
        </label>
        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Recording message…' : 'Send Message'}
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-center text-xs text-slate-500">
          We aim to respond within 1–2 business days.
        </p>
      </div>
    </form>
  )
}

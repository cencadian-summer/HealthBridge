import config from '@payload-config'
import { getPayload } from 'payload'

const subjectValues = ['general', 'resource', 'technical', 'partnership', 'feedback'] as const
type ContactSubject = (typeof subjectValues)[number]
const subjects: ReadonlySet<string> = new Set(subjectValues)

type ContactBody = {
  consent?: unknown
  email?: unknown
  message?: unknown
  name?: unknown
  subject?: unknown
  website?: unknown
}

export async function POST(request: Request) {
  let body: ContactBody

  try {
    body = (await request.json()) as ContactBody
  } catch {
    return Response.json({ message: 'Invalid request.' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return Response.json(
      { message: 'Your message has been received.', reference: 'HB-CONTACT' },
      { status: 201 },
    )
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const subject =
    typeof body.subject === 'string' && subjects.has(body.subject)
      ? (body.subject as ContactSubject)
      : null

  if (name.length < 2 || name.length > 100) {
    return Response.json({ field: 'name', message: 'Enter your full name.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json(
      { field: 'email', message: 'Enter a valid email address.' },
      { status: 400 },
    )
  }
  if (!subject) {
    return Response.json({ field: 'subject', message: 'Select a subject.' }, { status: 400 })
  }
  if (message.length < 10 || message.length > 1000) {
    return Response.json(
      { field: 'message', message: 'Enter a message between 10 and 1000 characters.' },
      { status: 400 },
    )
  }
  if (body.consent !== true) {
    return Response.json(
      { field: 'consent', message: 'You must accept the Privacy Policy.' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config })
    const inquiry = await payload.create({
      collection: 'contact-inquiries',
      overrideAccess: true,
      data: {
        email,
        message,
        name,
        status: 'new',
        subject,
      },
    })
    const reference = `HB-${String(inquiry.id).slice(-8).toUpperCase()}`

    return Response.json(
      {
        message: 'Your inquiry has been recorded. Our team will get back to you soon.',
        reference,
      },
      { status: 201 },
    )
  } catch {
    return Response.json(
      { message: 'We could not record your message. Please try again.' },
      { status: 500 },
    )
  }
}

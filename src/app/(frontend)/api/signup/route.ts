import config from '@payload-config'
import { getPayload } from 'payload'

const audienceValues = [
  'new-immigrant',
  'international-student',
  'parent',
  'youth',
  'refugee',
  'healthcare-provider',
  'settlement-worker',
  'other',
] as const
type Audience = (typeof audienceValues)[number]
const audiences: ReadonlySet<string> = new Set(audienceValues)

const genderValues = ['woman', 'man', 'non-binary', 'prefer-not-to-say', 'self-described'] as const
type Gender = (typeof genderValues)[number]
const genders: ReadonlySet<string> = new Set(genderValues)

type SignupBody = {
  audience?: unknown
  dateOfBirth?: unknown
  email?: unknown
  gender?: unknown
  name?: unknown
  password?: unknown
  phone?: unknown
  termsAccepted?: unknown
}

export async function POST(request: Request) {
  let body: SignupBody

  try {
    body = (await request.json()) as SignupBody
  } catch {
    return Response.json({ message: 'Invalid request.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const dateOfBirth = typeof body.dateOfBirth === 'string' ? body.dateOfBirth : ''
  const gender =
    typeof body.gender === 'string' && genders.has(body.gender)
      ? (body.gender as Gender)
      : undefined
  const audience =
    typeof body.audience === 'string' && audiences.has(body.audience)
      ? (body.audience as Audience)
      : undefined

  if (name.length < 2 || name.length > 100) {
    return Response.json({ field: 'name', message: 'Enter your full name.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { field: 'email', message: 'Enter a valid email address.' },
      { status: 400 },
    )
  }
  if (
    password.length < 8 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return Response.json(
      {
        field: 'password',
        message: 'Use at least 8 characters with a letter, number, and symbol.',
      },
      { status: 400 },
    )
  }
  if (body.termsAccepted !== true) {
    return Response.json(
      { field: 'terms', message: 'You must accept the terms to continue.' },
      { status: 400 },
    )
  }
  if (phone && (phone.length < 7 || phone.length > 25)) {
    return Response.json(
      { field: 'phone', message: 'Enter a valid phone number.' },
      { status: 400 },
    )
  }
  if (dateOfBirth) {
    const parsedDate = new Date(`${dateOfBirth}T00:00:00.000Z`)
    if (Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      return Response.json(
        { field: 'dateOfBirth', message: 'Enter a valid date of birth.' },
        { status: 400 },
      )
    }
  }

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        phone: phone || undefined,
        audiences: audience ? [audience] : [],
        role: 'member',
        professionalStatus: 'not-applicable',
        onboardingComplete: false,
      },
    })

    return Response.json(
      { message: 'Account created. Check your email to verify your account before logging in.' },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('email') || message.includes('duplicate') || message.includes('unique')) {
      return Response.json(
        { field: 'email', message: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    return Response.json(
      { message: 'We could not create your account. Please try again.' },
      { status: 500 },
    )
  }
}

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: async () => ({ create: mocks.create }),
}))

const validInquiry = {
  consent: true,
  email: 'person@example.com',
  message: 'I would like help finding the right resource.',
  name: 'Test Person',
  subject: 'resource',
  website: '',
}

function contactRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

describe('contact inquiry route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.create.mockResolvedValue({ id: '507f1f77bcf86cd799439011' })
  })

  it('records a validated inquiry and returns a reference', async () => {
    const { POST } = await import('@/app/(frontend)/api/contact/route')
    const response = await POST(contactRequest(validInquiry))
    const body = (await response.json()) as { message: string; reference: string }

    expect(response.status).toBe(201)
    expect(body.message).toContain('recorded')
    expect(body.reference).toBe('HB-99439011')
    expect(mocks.create).toHaveBeenCalledWith({
      collection: 'contact-inquiries',
      overrideAccess: true,
      data: {
        email: validInquiry.email,
        message: validInquiry.message,
        name: validInquiry.name,
        status: 'new',
        subject: validInquiry.subject,
      },
    })
  })

  it('rejects invalid fields without writing an inquiry', async () => {
    const { POST } = await import('@/app/(frontend)/api/contact/route')
    const response = await POST(contactRequest({ ...validInquiry, message: 'Short' }))

    expect(response.status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions without storing them', async () => {
    const { POST } = await import('@/app/(frontend)/api/contact/route')
    const response = await POST(contactRequest({ ...validInquiry, website: 'spam.example' }))

    expect(response.status).toBe(201)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('returns an error when Payload cannot record the inquiry', async () => {
    mocks.create.mockRejectedValueOnce(new Error('database unavailable'))
    const { POST } = await import('@/app/(frontend)/api/contact/route')
    const response = await POST(contactRequest(validInquiry))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      message: 'We could not record your message. Please try again.',
    })
  })
})

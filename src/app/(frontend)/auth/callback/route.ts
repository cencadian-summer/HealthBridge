import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestURL = new URL(request.url)
  const code = requestURL.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL('/onboarding', requestURL.origin))
  }

  return NextResponse.redirect(new URL('/login?error=confirmation_failed', requestURL.origin))
}

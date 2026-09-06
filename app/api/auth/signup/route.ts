import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  let body: { username?: string; email?: string; phone?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const username = (body.username ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const phone = (body.phone ?? '').trim()
  const password = body.password ?? ''

  // Server-side validation
  if (username.length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Create the user already confirmed so no email link is required.
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    phone: phone || undefined,
    user_metadata: { username, phone },
  })

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try logging in.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: error.message ?? 'Could not create account.' }, { status: 400 })
  }

  // Ensure the profile row reflects the chosen username/phone (trigger also handles this).
  if (data.user) {
    await admin
      .from('profiles')
      .upsert({ id: data.user.id, username, phone }, { onConflict: 'id' })
  }

  return NextResponse.json({ ok: true })
}

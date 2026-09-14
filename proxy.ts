import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// The middleware only refreshes the Supabase session cookie; it does NOT gate
// routes. Server-side login-first gating breaks inside the v0 preview's
// cross-site iframe: the browser will not reliably send the session cookie to
// the server there, so a server-side session check always fails and traps the
// user in a redirect loop back to /auth/login. Access control is handled in
// the app (client-side) instead, so the platform is reachable in the preview.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // SameSite=None; Secure; Partitioned so the session cookie survives the
      // v0 preview's cross-site iframe (see lib/supabase/client.ts for the
      // full rationale).
      cookieOptions: { sameSite: 'none', secure: true, partitioned: true },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session token if needed. Never redirect based on the result.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|grip-logo.png|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

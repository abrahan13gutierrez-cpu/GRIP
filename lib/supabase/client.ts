import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // SameSite=None; Secure so the session cookie is sent inside the v0
      // preview's cross-site iframe. Without this, login succeeds but the
      // session cookie is dropped and the middleware bounces back to /login.
      cookieOptions: { sameSite: 'none', secure: true },
    },
  )
}

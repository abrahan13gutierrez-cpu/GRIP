import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // SameSite=None; Secure; Partitioned so the session cookie is accepted
      // inside the v0 preview's cross-site iframe. Chrome blocks third-party
      // cookies by default, so the Partitioned attribute (CHIPS) is required —
      // without it login succeeds but the cookie is dropped and the middleware
      // bounces back to /login.
      cookieOptions: { sameSite: 'none', secure: true, partitioned: true },
    },
  )
}

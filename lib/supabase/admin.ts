import { createClient } from '@supabase/supabase-js'

// Server-only admin client. NEVER import this in client components.
// Uses the service role key to create pre-confirmed users so the prototype
// does not depend on email confirmation links (which break outside the sandbox).
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured.')
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

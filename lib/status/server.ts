import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function getRequestUser(request: Request) {
  const admin = createAdminClient()
  const auth = request.headers.get("authorization")
  if (auth?.startsWith("Bearer ")) {
    const { data } = await admin.auth.getUser(auth.slice(7))
    if (data.user) return { user: data.user, admin }
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user, admin }
}

export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

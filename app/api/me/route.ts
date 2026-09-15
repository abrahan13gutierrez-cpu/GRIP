import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Perfil del usuario actual para el chip de la barra superior del chat.
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ profile: null })

  const admin = createAdminClient()
  const db = admin ?? supabase
  const { data: p } = await db
    .from("profiles")
    .select("id, username, display_name, full_name, avatar_url, nivel, power_points, role")
    .eq("id", user.id)
    .maybeSingle()

  const name = p?.display_name || p?.full_name || p?.username || user.email?.split("@")[0] || "Catcher"
  return NextResponse.json({
    profile: {
      id: user.id,
      email: user.email ?? null,
      name,
      username: p?.username ?? null,
      avatar_url: p?.avatar_url ?? null,
      nivel: p?.nivel ?? "Rookie",
      power_points: p?.power_points ?? 0,
      role: p?.role ?? "catcher",
    },
  })
}

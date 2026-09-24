import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  const raw = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return raw.toUpperCase()
}

// La lista de miembros es estructura compartida (perfiles). Se lee con
// service-role para que el panel siempre cargue, sin depender de la sesión del
// iframe. "En línea" = envió un mensaje en los últimos 10 minutos (señal real).
export async function GET() {
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ members: [] })

  const { data: profs, error } = await admin
    .from("profiles")
    .select("id, username, display_name, full_name, avatar_url, role")
    .limit(300)

  if (error) {
    console.log("[v0] GET /api/chat/members error:", error.message)
    return NextResponse.json({ members: [] })
  }

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: recent } = await admin.from("messages").select("user_id").gte("created_at", since)
  const online = new Set((recent ?? []).map((r) => r.user_id))

  const members = (profs ?? []).map((p) => {
    const name = p.display_name || p.full_name || p.username || "member"
    const roleRaw = (p.role || "").toLowerCase()
    const role: "Coach" | "Student" | "Bot" = roleRaw.includes("coach")
      ? "Coach"
      : roleRaw.includes("bot")
        ? "Bot"
        : "Student"
    return {
      id: p.id,
      name,
      role,
      avatar_url: p.avatar_url ?? null,
      initials: initialsFrom(name),
      online: online.has(p.id),
    }
  })

  return NextResponse.json({ members })
}

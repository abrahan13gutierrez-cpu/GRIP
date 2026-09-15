import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Orden de rangos del protocolo GRIP (mismo que components/dashboard/cursos-protocol.tsx).
const RANKS = [
  { key: "rookie", name: "Rookie", tag: "In the game" },
  { key: "backstop", name: "Backstop", tag: "Handling the game" },
  { key: "starter", name: "Starter", tag: "Driving the game" },
  { key: "gamer", name: "Gamer", tag: "Changing the game" },
  { key: "captain", name: "Captain", tag: "Leading the game" },
  { key: "commander", name: "Commander", tag: "Commanding the game" },
]
// 5 skills × 5 sublevels = casillas por rango.
const PROTOCOL_TOTAL = 25

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [{ data: profile }, { data: protocolRows }, { data: missionRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, phone, phone_verified, created_at, avatar_url, nivel, power_points, login_streak, bio")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("protocol_progress").select("status, updated_at").eq("user_id", user.id),
    supabase.from("mission_progress").select("status").eq("user_id", user.id),
  ])

  const protocolDone = (protocolRows ?? []).filter((r) => r.status === "done").length
  const protocolPct = Math.min(100, Math.round((protocolDone / PROTOCOL_TOTAL) * 100))
  const missionsDone = (missionRows ?? []).filter((r) => r.status === "completed").length
  const videosWatched = (missionRows ?? []).filter(
    (r) => r.status === "completed" || r.status === "in_progress",
  ).length
  const lastActivity = (protocolRows ?? []).reduce<string | null>((acc, r) => {
    if (!r.updated_at) return acc
    return !acc || r.updated_at > acc ? r.updated_at : acc
  }, null)

  const nivel = profile?.nivel ?? "Rookie"
  const currentIdx = Math.max(
    0,
    RANKS.findIndex((r) => r.name.toLowerCase() === nivel.toLowerCase()),
  )
  const nextLevel = RANKS[currentIdx + 1]?.name ?? null

  const journey = RANKS.map((r, i) => ({
    key: r.key,
    name: r.name,
    tag: r.tag,
    status: i < currentIdx ? "done" : i === currentIdx ? "current" : "locked",
    completedAt: i < currentIdx ? profile?.created_at ?? null : i === currentIdx ? lastActivity : null,
  }))

  return NextResponse.json({
    profile: {
      username: profile?.username ?? user.email?.split("@")[0] ?? "member",
      email: user.email ?? null,
      phone: profile?.phone ?? null,
      phoneVerified: profile?.phone_verified ?? false,
      avatarUrl: profile?.avatar_url ?? null,
      nivel,
      powerPoints: profile?.power_points ?? 0,
      loginStreak: profile?.login_streak ?? 0,
      bio: profile?.bio ?? null,
      createdAt: profile?.created_at ?? null,
    },
    stats: { protocolDone, protocolTotal: PROTOCOL_TOTAL, protocolPct, missionsDone, videosWatched, nextLevel },
    journey,
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const patch: Record<string, string | null> = {}
  if (typeof body.username === "string") {
    const u = body.username.trim()
    if (u.length < 2 || u.length > 40) return NextResponse.json({ error: "Username inválido" }, { status: 400 })
    patch.username = u
  }
  if (typeof body.phone === "string") patch.phone = body.phone.trim() || null
  if (typeof body.bio === "string") patch.bio = body.bio.trim().slice(0, 280) || null

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 })

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id)
  if (error) {
    console.log("[v0] PATCH profile error:", error.message)
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

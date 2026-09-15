import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Notificaciones recientes del usuario (menciones, respuestas, reacciones).
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ notifications: [], unread: 0 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ notifications: [], unread: 0 })

  const { data: rows, error } = await admin
    .from("notifications")
    .select("id, type, summary, emoji, read, created_at, channel_id, message_id, actor_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30)

  if (error) {
    console.log("[v0] GET /api/chat/notifications error:", error.message)
    return NextResponse.json({ notifications: [], unread: 0 })
  }

  const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_id).filter(Boolean))) as string[]
  const channelIds = Array.from(new Set((rows ?? []).map((r) => r.channel_id).filter(Boolean))) as string[]

  const [actorsRes, channelsRes] = await Promise.all([
    actorIds.length
      ? admin.from("profiles").select("id, username, display_name, avatar_url").in("id", actorIds)
      : Promise.resolve({ data: [] as any[] }),
    channelIds.length
      ? admin.from("channels").select("id, name, emoji").in("id", channelIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const actorMap = new Map((actorsRes.data ?? []).map((a: any) => [a.id, a]))
  const channelMap = new Map((channelsRes.data ?? []).map((c: any) => [c.id, c]))

  const notifications = (rows ?? []).map((r) => {
    const a = actorMap.get(r.actor_id)
    const c = channelMap.get(r.channel_id)
    return {
      id: r.id,
      type: r.type,
      summary: r.summary ?? "",
      emoji: r.emoji ?? null,
      read: r.read,
      createdAt: r.created_at,
      channelId: r.channel_id,
      channelName: c?.name ?? "",
      channelEmoji: c?.emoji ?? null,
      messageId: r.message_id,
      actor: a?.display_name || a?.username || "Alguien",
      actorAvatar: a?.avatar_url ?? null,
    }
  })

  const unread = notifications.filter((n) => !n.read).length
  return NextResponse.json({ notifications, unread })
}

// Marca notificaciones como leídas (una si se pasa id, o todas).
export async function PATCH(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const body = await request.json().catch(() => null)
  const id = body?.id ? String(body.id) : null

  let query = admin.from("notifications").update({ read: true }).eq("user_id", user.id)
  if (id) query = query.eq("id", id)
  else query = query.eq("read", false)
  await query
  return NextResponse.json({ ok: true })
}

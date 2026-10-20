import { NextResponse } from "next/server"
import { getRequestUser } from "@/lib/status/server"

const UUID = /^[0-9a-f-]{36}$/i

export async function GET(request: Request) {
  const channelId = new URL(request.url).searchParams.get("channelId") ?? ""
  if (!UUID.test(channelId)) return NextResponse.json({ pins: [] })
  const { admin } = await getRequestUser(request)

  const { data, error } = await admin
    .from("messages")
    .select("id, user_id, content, created_at, pinned_at, profiles!inner(username, display_name, avatar_url)")
    .eq("channel_id", channelId)
    .not("pinned_at", "is", null)
    .order("pinned_at", { ascending: false })
    .limit(50)

  if (error) {
    console.log("[v0] GET /api/status/pins error:", error.message)
    return NextResponse.json({ pins: [] })
  }

  const pins = (data ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      id: m.id,
      user_id: m.user_id,
      content: m.content,
      created_at: m.created_at,
      pinned_at: m.pinned_at,
      author: p?.display_name || p?.username || "member",
      avatar_url: p?.avatar_url ?? null,
    }
  })
  return NextResponse.json({ pins })
}

// Authors can pin their own messages; coaches and admins can pin any.
export async function POST(request: Request) {
  const { user, admin } = await getRequestUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const messageId = typeof body?.messageId === "string" ? body.messageId : ""
  const pinned = Boolean(body?.pinned)
  if (!UUID.test(messageId)) return NextResponse.json({ error: "Invalid message" }, { status: 400 })

  const [{ data: msg }, { data: profile }] = await Promise.all([
    admin.from("messages").select("user_id").eq("id", messageId).maybeSingle(),
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ])
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const role = (profile?.role ?? "").toLowerCase()
  const canPin = msg.user_id === user.id || role.includes("coach") || role.includes("admin")
  if (!canPin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { error } = await admin
    .from("messages")
    .update(pinned ? { pinned_at: new Date().toISOString(), pinned_by: user.id } : { pinned_at: null, pinned_by: null })
    .eq("id", messageId)
  if (error) {
    console.log("[v0] POST /api/status/pins error:", error.message)
    return NextResponse.json({ error: "Could not update pin" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

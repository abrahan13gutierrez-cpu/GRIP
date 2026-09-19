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

// Lista de mensajes guardados del usuario.
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ saved: [] })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ saved: [] })

  const { data, error } = await admin
    .from("saved_messages")
    .select(
      "message_id, created_at, messages!inner(id, content, created_at, channel_id, user_id, profiles!inner(username, display_name, avatar_url), channels(name, emoji))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.log("[v0] GET /api/chat/saved error:", error.message)
    return NextResponse.json({ saved: [] })
  }

  const saved = (data ?? []).map((row: any) => {
    const m = Array.isArray(row.messages) ? row.messages[0] : row.messages
    const p = m && (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles)
    const ch = m && (Array.isArray(m.channels) ? m.channels[0] : m.channels)
    return {
      messageId: row.message_id,
      content: m?.content ?? "",
      createdAt: m?.created_at ?? row.created_at,
      channelId: m?.channel_id ?? null,
      channelName: ch?.name ?? "",
      channelEmoji: ch?.emoji ?? null,
      author: p?.display_name || p?.username || "member",
      avatarUrl: p?.avatar_url ?? null,
    }
  })

  return NextResponse.json({ saved })
}

// Guardar un mensaje.
export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const body = await request.json().catch(() => null)
  const messageId = String(body?.messageId ?? "")
  if (!messageId) return NextResponse.json({ error: "Bad request" }, { status: 400 })

  const { error } = await admin
    .from("saved_messages")
    .upsert({ user_id: user.id, message_id: messageId }, { onConflict: "user_id,message_id", ignoreDuplicates: true })
  if (error) {
    console.log("[v0] POST /api/chat/saved error:", error.message)
    return NextResponse.json({ error: "Could not save." }, { status: 500 })
  }
  return NextResponse.json({ saved: true })
}

// Quitar de guardados.
export async function DELETE(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const body = await request.json().catch(() => null)
  const messageId = String(body?.messageId ?? "")
  if (!messageId) return NextResponse.json({ error: "Bad request" }, { status: 400 })

  await admin.from("saved_messages").delete().eq("user_id", user.id).eq("message_id", messageId)
  return NextResponse.json({ saved: false })
}

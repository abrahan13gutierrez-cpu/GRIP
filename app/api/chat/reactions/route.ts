import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Alterna una reacción emoji sobre un mensaje. Si ya existía la quita; si no, la
// crea y notifica al autor del mensaje (salvo que reaccione a sí mismo).
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const messageId = String(body?.messageId ?? "")
  const emoji = String(body?.emoji ?? "")
  if (!messageId || !emoji) return NextResponse.json({ error: "Bad request" }, { status: 400 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const { data: existing } = await admin
    .from("reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle()

  if (existing) {
    await admin.from("reactions").delete().eq("id", existing.id)
    return NextResponse.json({ reacted: false })
  }

  const { error } = await admin.from("reactions").insert({ message_id: messageId, user_id: user.id, emoji })
  if (error) {
    console.log("[v0] POST /api/chat/reactions error:", error.message)
    return NextResponse.json({ error: "Could not react." }, { status: 500 })
  }

  try {
    const { data: msg } = await admin.from("messages").select("user_id, channel_id").eq("id", messageId).single()
    if (msg && msg.user_id !== user.id) {
      await admin.from("notifications").insert({
        user_id: msg.user_id,
        actor_id: user.id,
        channel_id: msg.channel_id,
        message_id: messageId,
        type: "reaction",
        emoji,
      })
    }
  } catch (e) {
    console.log("[v0] reaction notification error", e)
  }

  return NextResponse.json({ reacted: true })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Lee mensajes de un canal. El contenido del canal es compartido, así que se
// lee con service-role (robusto frente a la sesión del iframe); la sesión sólo
// se usa, en el mejor esfuerzo, para marcar "mine" y las reacciones propias.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channelId")
  if (!channelId) return NextResponse.json({ messages: [], me: null })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const db = admin ?? supabase

  const { data, error } = await db
    .from("messages")
    .select(
      "id, channel_id, user_id, content, created_at, reply_to, profiles!inner(username, display_name, avatar_url)",
    )
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(100)

  if (error) {
    console.log("[v0] GET /api/chat/messages error:", error.message)
    return NextResponse.json({ messages: [], me: user?.id ?? null })
  }

  const rows = data ?? []
  const ids = rows.map((r) => r.id)

  // Reacciones agregadas por mensaje.
  const reactionMap = new Map<string, Map<string, { count: number; mine: boolean }>>()
  if (ids.length && admin) {
    const { data: reacts } = await admin.from("reactions").select("message_id, emoji, user_id").in("message_id", ids)
    for (const r of reacts ?? []) {
      const per = reactionMap.get(r.message_id) ?? new Map()
      const cur = per.get(r.emoji) ?? { count: 0, mine: false }
      cur.count += 1
      if (user && r.user_id === user.id) cur.mine = true
      per.set(r.emoji, cur)
      reactionMap.set(r.message_id, per)
    }
  }

  // Autores por id, para resolver "en respuesta a".
  const authorById = new Map<string, string>()
  for (const r of rows) {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    authorById.set(r.user_id, p?.display_name || p?.username || "member")
  }
  const contentById = new Map(rows.map((r) => [r.id, r.content as string]))

  const messages = rows.map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : (r.profiles as any)
    const per = reactionMap.get(r.id)
    const reactions = per
      ? Array.from(per.entries()).map(([emoji, v]) => ({ emoji, count: v.count, mine: v.mine }))
      : []
    const replyAuthor = r.reply_to ? authorById.get(rows.find((x) => x.id === r.reply_to)?.user_id ?? "") : null
    return {
      id: r.id,
      channel_id: r.channel_id,
      user_id: r.user_id,
      content: r.content,
      created_at: r.created_at,
      username: p?.display_name || p?.username || "member",
      avatar_url: p?.avatar_url ?? null,
      mine: user ? r.user_id === user.id : false,
      reactions,
      replyTo: r.reply_to ?? null,
      replyAuthor: replyAuthor ?? null,
      replySnippet: r.reply_to ? (contentById.get(r.reply_to) ?? null) : null,
    }
  })

  return NextResponse.json({ messages, me: user?.id ?? null })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const channelId = String(body?.channelId ?? "")
  const content = String(body?.content ?? "").trim()
  const replyTo = body?.replyTo ? String(body.replyTo) : null
  if (!channelId || !content) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 })
  if (content.length > 2000) return NextResponse.json({ error: "Message is too long." }, { status: 400 })

  const insert: Record<string, unknown> = { channel_id: channelId, user_id: user.id, content }
  if (replyTo) insert.reply_to = replyTo

  const { error } = await supabase.from("messages").insert(insert)

  if (error) {
    console.log("[v0] POST /api/chat/messages error:", error.message)
    return NextResponse.json({ error: "Could not send message." }, { status: 500 })
  }

  // Notifica al autor del mensaje respondido (best-effort).
  if (replyTo) {
    try {
      const admin = createAdminClient()
      if (admin) {
        const { data: parent } = await admin.from("messages").select("user_id").eq("id", replyTo).single()
        if (parent && parent.user_id !== user.id) {
          await admin.from("notifications").insert({
            user_id: parent.user_id,
            actor_id: user.id,
            channel_id: channelId,
            message_id: replyTo,
            type: "reply",
          })
        }
      }
    } catch (e) {
      console.log("[v0] reply notification error", e)
    }
  }

  return NextResponse.json({ ok: true })
}

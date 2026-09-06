import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channelId")
  if (!channelId) return NextResponse.json({ messages: [], me: null })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ messages: [], me: null }, { status: 401 })

  const { data, error } = await supabase
    .from("messages")
    .select("id, channel_id, user_id, content, created_at, profiles!inner(username)")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(100)

  if (error) {
    console.log("[v0] GET /api/chat/messages error:", error.message)
    return NextResponse.json({ messages: [], me: user.id })
  }

  const messages = (data ?? []).map((r) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      channel_id: r.channel_id,
      user_id: r.user_id,
      content: r.content,
      created_at: r.created_at,
      username: profile?.username ?? "member",
      mine: r.user_id === user.id,
    }
  })

  return NextResponse.json({ messages, me: user.id })
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
  if (!channelId || !content) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 })
  if (content.length > 2000) return NextResponse.json({ error: "Message is too long." }, { status: 400 })

  const { error } = await supabase.from("messages").insert({
    channel_id: channelId,
    user_id: user.id,
    content,
  })

  if (error) {
    console.log("[v0] POST /api/chat/messages error:", error.message)
    return NextResponse.json({ error: "Could not send message." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

import { NextResponse } from "next/server"
import { getRequestUser, utcDay } from "@/lib/status/server"
import { CHAT_CATEGORIES } from "@/lib/status/config"

const EMPTY = { channels: {}, total: 0, mentions: 0, sections: {} }

// Also acts as the presence heartbeat: every poll refreshes last_seen_at.
export async function GET(request: Request) {
  const { user, admin } = await getRequestUser(request)
  if (!user) return NextResponse.json(EMPTY)

  const [{ data: profile }, { data: visible }] = await Promise.all([
    admin.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id).select("username").maybeSingle(),
    admin.from("channels").select("id").in("slug", CHAT_CATEGORIES.flatMap((c) => c.slugs)),
  ])

  const { data, error } = await admin.rpc("unread_counts", { p_user: user.id, p_handle: profile?.username ?? "" })
  if (error) {
    console.log("[v0] GET /api/status/unread error:", error.message)
    return NextResponse.json(EMPTY)
  }

  const visibleIds = new Set((visible ?? []).map((c) => c.id))
  const channels: Record<string, { unread: number; mentions: number }> = {}
  let total = 0
  let mentions = 0
  for (const row of (data ?? []) as { channel_id: string; unread: number; mentions: number }[]) {
    if (!visibleIds.has(row.channel_id)) continue
    channels[row.channel_id] = { unread: row.unread, mentions: row.mentions }
    total += row.unread
    mentions += row.mentions
  }

  const { data: puzzle } = await admin
    .from("user_xp")
    .select("id")
    .eq("user_id", user.id)
    .eq("reason", "daily_puzzle")
    .eq("source_id", utcDay())
    .maybeSingle()

  return NextResponse.json({ channels, total, mentions, sections: { chat: total, courses: puzzle ? 0 : 1 } })
}

export async function POST(request: Request) {
  const { user, admin } = await getRequestUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const channelId = typeof body?.channelId === "string" ? body.channelId : ""
  if (!/^[0-9a-f-]{36}$/i.test(channelId)) return NextResponse.json({ error: "Invalid channel" }, { status: 400 })

  const { error } = await admin
    .from("channel_reads")
    .upsert({ user_id: user.id, channel_id: channelId, last_read_at: new Date().toISOString() }, { onConflict: "user_id,channel_id" })
  if (error) {
    console.log("[v0] POST /api/status/unread error:", error.message)
    return NextResponse.json({ error: "Could not mark read" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

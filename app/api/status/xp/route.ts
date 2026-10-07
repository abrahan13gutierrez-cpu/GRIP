import { NextResponse } from "next/server"
import { getRequestUser, utcDay } from "@/lib/status/server"
import { XP_RULES, type XpReason } from "@/lib/status/config"

// XP is only granted for actions the server can verify; the unique
// (user, reason, source) constraint makes every award idempotent.
export async function POST(request: Request) {
  const { user, admin } = await getRequestUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const reason = body?.reason as XpReason
  const sourceId = typeof body?.sourceId === "string" ? body.sourceId.slice(0, 120) : ""
  if (!(reason in XP_RULES)) return NextResponse.json({ error: "Invalid reason" }, { status: 400 })

  let recipient = user.id
  let source = sourceId

  if (reason === "daily_puzzle") {
    source = utcDay()
  } else if (reason === "lesson_complete") {
    const [courseId, pctRaw] = sourceId.split(":")
    const pct = Number(pctRaw)
    if (!courseId || !Number.isInteger(pct) || pct < 1 || pct > 100) {
      return NextResponse.json({ error: "Invalid lesson" }, { status: 400 })
    }
    const { data: progress } = await admin
      .from("course_progress")
      .select("progress")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle()
    if (!progress || progress.progress < pct) return NextResponse.json({ awarded: false })
  } else if (reason === "reaction_received") {
    const { data: reaction } = await admin
      .from("reactions")
      .select("id, messages!inner(user_id)")
      .eq("message_id", sourceId)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
    const msg = reaction ? (Array.isArray(reaction.messages) ? reaction.messages[0] : reaction.messages) : null
    if (!msg || msg.user_id === user.id) return NextResponse.json({ awarded: false })
    recipient = msg.user_id
    source = `${sourceId}:${user.id}`
  }

  const { error } = await admin
    .from("user_xp")
    .upsert(
      { user_id: recipient, amount: XP_RULES[reason], reason, source_id: source },
      { onConflict: "user_id,reason,source_id", ignoreDuplicates: true },
    )
  if (error) {
    console.log("[v0] POST /api/status/xp error:", error.message)
    return NextResponse.json({ error: "Could not award XP" }, { status: 500 })
  }
  return NextResponse.json({ awarded: true })
}

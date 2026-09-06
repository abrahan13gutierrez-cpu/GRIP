import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const STATUSES = ["pending", "in_progress", "completed"] as const

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ progress: {} }, { status: 401 })

  const { data, error } = await supabase
    .from("mission_progress")
    .select("drill_id, status")
    .eq("user_id", user.id)

  if (error) {
    console.log("[v0] GET missions progress error:", error.message)
    return NextResponse.json({ progress: {} })
  }

  const progress: Record<number, string> = {}
  for (const row of data ?? []) progress[row.drill_id] = row.status
  return NextResponse.json({ progress })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const drillId = Number(body?.drillId)
  const status = String(body?.status ?? "")
  if (!Number.isInteger(drillId) || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { error } = await supabase
    .from("mission_progress")
    .upsert({ user_id: user.id, drill_id: drillId, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,drill_id" })

  if (error) {
    console.log("[v0] POST missions progress error:", error.message)
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

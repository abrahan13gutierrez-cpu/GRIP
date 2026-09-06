import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ progress: {} }, { status: 401 })

  const { data, error } = await supabase
    .from("course_progress")
    .select("course_id, progress")
    .eq("user_id", user.id)

  if (error) {
    console.log("[v0] GET courses progress error:", error.message)
    return NextResponse.json({ progress: {} })
  }

  const progress: Record<string, number> = {}
  for (const row of data ?? []) progress[row.course_id] = row.progress
  return NextResponse.json({ progress })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const courseId = String(body?.courseId ?? "")
  let progress = Number(body?.progress)
  if (!courseId || !Number.isFinite(progress)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  progress = Math.max(0, Math.min(100, Math.round(progress)))

  const { error } = await supabase
    .from("course_progress")
    .upsert({ user_id: user.id, course_id: courseId, progress, updated_at: new Date().toISOString() }, { onConflict: "user_id,course_id" })

  if (error) {
    console.log("[v0] POST courses progress error:", error.message)
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

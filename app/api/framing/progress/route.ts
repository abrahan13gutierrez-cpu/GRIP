import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getFramingUnit } from "@/lib/framing/curriculum"
import { applyFramingTransition, getFramingProgress } from "@/lib/framing/progress"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const progress = await getFramingProgress(supabase, user.id)
  return NextResponse.json({ progress })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const etapaSlug = typeof body?.etapaSlug === "string" ? body.etapaSlug : null
  const subnivelSlug = typeof body?.subnivelSlug === "string" ? body.subnivelSlug : null
  const action = body?.action

  if (!etapaSlug || !subnivelSlug || !["video_complete", "quiz_pass", "quiz_fail"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  if (!getFramingUnit(etapaSlug, subnivelSlug)) {
    return NextResponse.json({ error: "Unidad no encontrada" }, { status: 404 })
  }

  const result = await applyFramingTransition(supabase, user.id, etapaSlug, subnivelSlug, action)
  if (result.error) return NextResponse.json({ error: result.error, status: result.status }, { status: 400 })
  return NextResponse.json({ status: result.status })
}

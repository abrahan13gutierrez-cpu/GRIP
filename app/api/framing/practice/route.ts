import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { getFramingUnit } from "@/lib/framing/curriculum"
import { markPracticeSubmitted } from "@/lib/framing/progress"

// Cliente admin opcional: algunos entornos de preview restringen el cliente
// con cookies de sesión. Mismo patrón usado en el resto de rutas de API del proyecto.
function adminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createAdminClient(url, key)
}

/**
 * POST /api/framing/practice
 * Registra la práctica subida por el usuario para una unidad de Framing, justo
 * después de que UpChunk confirma la subida a Mux (no espera al webhook de
 * encoding). El playback queda pendiente hasta que el asset termine de
 * procesarse; el catcher ya avanza porque, por decisión de producto, "la
 * práctica cuenta como completada al subirse".
 * 1. Crea la fila en `videos` (kind="practice", playback_id aún null).
 * 2. Crea la entrega en `feedback_submissions` (status="pending") para el coach.
 * 3. Avanza `protocol_progress` a "practice_submitted" (requiere quiz aprobado).
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const etapaSlug = typeof body?.etapaSlug === "string" ? body.etapaSlug : null
  const subnivelSlug = typeof body?.subnivelSlug === "string" ? body.subnivelSlug : null

  if (!etapaSlug || !subnivelSlug) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const unit = getFramingUnit(etapaSlug, subnivelSlug)
  if (!unit) return NextResponse.json({ error: "Unidad no encontrada" }, { status: 404 })

  const progressResult = await markPracticeSubmitted(supabase, user.id, etapaSlug, subnivelSlug)
  if (!progressResult.ok) return NextResponse.json({ error: progressResult.error }, { status: 400 })

  const db = adminClient() ?? supabase
  const drillReference = `framing:${etapaSlug}:${subnivelSlug}`

  const { data: video, error: videoError } = await db
    .from("videos")
    .insert({ kind: "practice", ref_id: drillReference, playback_id: null, title: unit.subnivelTitle, user_id: user.id })
    .select("id")
    .single()

  if (videoError) {
    console.log("[v0] framing practice video insert error:", videoError.message)
    return NextResponse.json({ error: "No se pudo guardar el video de práctica" }, { status: 500 })
  }

  const { error: feedbackError } = await db.from("feedback_submissions").insert({
    user_id: user.id,
    video_id: video.id,
    drill_reference: drillReference,
    status: "pending",
  })

  if (feedbackError) {
    console.log("[v0] framing feedback_submissions insert error:", feedbackError.message)
  }

  return NextResponse.json({ ok: true, status: "practice_submitted" })
}

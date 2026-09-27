import type { SupabaseClient } from "@supabase/supabase-js"
import { FRAMING_UNITS, unitKey } from "@/lib/framing/curriculum"

/**
 * Progreso de Framing — persistido en la tabla existente `protocol_progress`
 * (skill = `framing-<etapa>`, sublevel = `<subnivel>`, status = UnitStatus).
 * No se crean tablas nuevas: se reutiliza el esquema ya presente en Supabase.
 *
 * Ciclo confirmado: Video → Quiz aprobado → Práctica subida.
 * La práctica se considera completada al subirse (no depende del feedback del
 * coach para desbloquear la siguiente unidad).
 */
export type UnitStatus = "video_pending" | "video_complete" | "quiz_failed" | "quiz_passed" | "practice_submitted"

const RANK: Record<UnitStatus, number> = {
  video_pending: 0,
  video_complete: 1,
  quiz_failed: 1,
  quiz_passed: 2,
  practice_submitted: 3,
}

export const FRAMING_SKILL_PREFIX = "framing-"

export function framingSkill(etapaSlug: string) {
  return `${FRAMING_SKILL_PREFIX}${etapaSlug}`
}

export type FramingProgressMap = Record<string, UnitStatus>

export async function getFramingProgress(supabase: SupabaseClient, userId: string): Promise<FramingProgressMap> {
  const { data, error } = await supabase
    .from("protocol_progress")
    .select("skill, sublevel, status")
    .eq("user_id", userId)
    .like("skill", `${FRAMING_SKILL_PREFIX}%`)

  if (error) {
    console.log("[v0] getFramingProgress error:", error.message)
    return {}
  }

  const map: FramingProgressMap = {}
  for (const row of data ?? []) {
    const etapaSlug = row.skill.slice(FRAMING_SKILL_PREFIX.length)
    map[unitKey({ etapaSlug, subnivelSlug: row.sublevel })] = row.status as UnitStatus
  }
  return map
}

export function statusOf(map: FramingProgressMap, etapaSlug: string, subnivelSlug: string): UnitStatus {
  return map[unitKey({ etapaSlug, subnivelSlug })] ?? "video_pending"
}

/** Primera unidad no completada (o la última si todo está en práctica subida/hecho). */
export function resumeUnit(map: FramingProgressMap) {
  const pending = FRAMING_UNITS.find((u) => statusOf(map, u.etapaSlug, u.subnivelSlug) !== "practice_submitted")
  return pending ?? FRAMING_UNITS[FRAMING_UNITS.length - 1]
}

export function framingCourseProgressPct(map: FramingProgressMap) {
  const done = FRAMING_UNITS.filter((u) => statusOf(map, u.etapaSlug, u.subnivelSlug) === "practice_submitted").length
  return FRAMING_UNITS.length ? Math.round((done / FRAMING_UNITS.length) * 100) : 0
}

type Action = "video_complete" | "quiz_pass" | "quiz_fail"

/**
 * Aplica una transición de estado, monótona: nunca retrocede una unidad que ya
 * avanzó más allá del paso reportado (p.ej. reprobar el quiz no bloquea una
 * unidad cuya práctica ya fue subida).
 */
export async function applyFramingTransition(
  supabase: SupabaseClient,
  userId: string,
  etapaSlug: string,
  subnivelSlug: string,
  action: Action,
): Promise<{ status: UnitStatus; error?: string }> {
  const { data: existing } = await supabase
    .from("protocol_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("skill", framingSkill(etapaSlug))
    .eq("sublevel", subnivelSlug)
    .maybeSingle()

  const current = (existing?.status as UnitStatus | undefined) ?? "video_pending"

  let next: UnitStatus
  if (action === "video_complete") {
    if (RANK[current] >= RANK.video_complete) return { status: current }
    next = "video_complete"
  } else if (action === "quiz_pass") {
    if (RANK[current] < RANK.video_complete) return { status: current, error: "El video debe completarse antes del quiz" }
    if (RANK[current] >= RANK.quiz_passed) return { status: current }
    next = "quiz_passed"
  } else {
    // quiz_fail: solo informativo, no retrocede una unidad ya aprobada/practicada
    if (RANK[current] >= RANK.quiz_passed) return { status: current }
    next = "quiz_failed"
  }

  const { error } = existing
    ? await supabase
        .from("protocol_progress")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("skill", framingSkill(etapaSlug))
        .eq("sublevel", subnivelSlug)
    : await supabase
        .from("protocol_progress")
        .insert({ user_id: userId, skill: framingSkill(etapaSlug), sublevel: subnivelSlug, status: next })

  if (error) {
    console.log("[v0] applyFramingTransition error:", error.message)
    return { status: current, error: "No se pudo guardar el progreso" }
  }
  return { status: next }
}

/** Marca la unidad como práctica subida. Requiere quiz aprobado (o práctica ya subida, para permitir reintentos). */
export async function markPracticeSubmitted(
  supabase: SupabaseClient,
  userId: string,
  etapaSlug: string,
  subnivelSlug: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data: existing } = await supabase
    .from("protocol_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("skill", framingSkill(etapaSlug))
    .eq("sublevel", subnivelSlug)
    .maybeSingle()

  const current = (existing?.status as UnitStatus | undefined) ?? "video_pending"
  if (RANK[current] < RANK.quiz_passed) {
    return { ok: false, error: "Debes aprobar el quiz antes de subir tu práctica" }
  }

  const { error } = await supabase
    .from("protocol_progress")
    .update({ status: "practice_submitted", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("skill", framingSkill(etapaSlug))
    .eq("sublevel", subnivelSlug)

  if (error) {
    console.log("[v0] markPracticeSubmitted error:", error.message)
    return { ok: false, error: "No se pudo guardar la práctica" }
  }
  return { ok: true }
}

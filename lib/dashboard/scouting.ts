/**
 * GRIP — Sistema visual "expediente de scouting profesional".
 *
 * La app se presenta como un dosier de scouting de béisbol: cada módulo, curso
 * y habilidad se califica en la escala real 20-80 (20 = mínimo, 80 = elite),
 * nunca con porcentajes de SaaS ni badges verdes de "completado".
 *
 * Paleta (navy dosier):
 *   base #0B1120 · superficie #131C33 · borde #2A3552 · activo/dorado #C9A227
 *   texto #F5F3EC · secundario #8A93A8 · deshabilitado #5C6580
 */

export const SCOUT = {
  base: "#0B1120",
  surface: "#131C33",
  border: "#2A3552",
  active: "#C9A227",
  gold: "#C9A227",
  text: "#F5F3EC",
  muted: "#8A93A8",
  disabled: "#5C6580",
} as const

export type Grade = { value: number; label: string; graded: boolean }

/**
 * Convierte progreso 0-100 (más su estado de bloqueo) a un grado de scouting 20-80.
 * - Bloqueado → sin calificar.
 * - Desbloqueado sin avance → grado 0 (NUEVO).
 * - Completado → 80 (MÁXIMO).
 * - En progreso → 20-80 proporcional (mínimo 20, la base de la escala).
 */
export function toGrade(progress: number, unlocked: boolean): Grade {
  if (!unlocked) return { value: 0, label: "SIN CALIFICAR", graded: false }
  if (progress <= 0) return { value: 0, label: "NUEVO", graded: true }
  if (progress >= 100) return { value: 80, label: "MÁXIMO", graded: true }
  return { value: Math.max(20, Math.round((progress / 100) * 80)), label: "EN CURSO", graded: true }
}

/** Número de certificado tipo "GR-04" a partir del índice de la tarjeta. */
export function certNo(index: number): string {
  return `GR-${String(index + 1).padStart(2, "0")}`
}

/** Etiqueta de estado para la barra superior de una tarjeta-certificado. */
export function gradeStatus(g: Grade): string {
  return g.graded ? `GRADO ${g.value} · ${g.label}` : "SIN CALIFICAR"
}

/** Ancho porcentual de una barra en la escala 20-80 (20 = 0%, 80 = 100%). */
export function scoutFill(value: number): number {
  return Math.max(0, Math.min(100, ((value - 20) / 60) * 100))
}

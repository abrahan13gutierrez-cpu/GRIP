"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"
import { scoutFill, toGrade } from "@/lib/dashboard/scouting"

/**
 * GRIP — Ficha de prospecto (reproductor de lección como dosier de scouting).
 *
 * Recibe un `course` con módulos y lecciones y lo presenta como un expediente:
 * tarjeta-certificado con el video + grado general, escala de scouting 20-80,
 * línea de progresión del curso y veredicto del coach.
 * Paleta: base #0B1120, superficie #131C33, borde #2A3552 (dorado #C9A227 activo).
 * Números y grados en serif. Reutilizable por cualquier tarjeta de Cursos.
 */

export type Lesson = {
  id: string
  title: string
  playbackId: string
  completed?: boolean
}

export type Module = {
  id: string
  title: string
  lessons: Lesson[]
}

export type Course = {
  id: string
  title: string
  modules: Module[]
}

export function LessonPlayer({ course, onBack }: { course: Course; onBack: () => void }) {
  // Aplana las lecciones para navegar linealmente (siguiente lección atraviesa módulos).
  const flat = useMemo(
    () =>
      course.modules.flatMap((m, mi) =>
        m.lessons.map((l, li) => ({ lesson: l, module: m, moduleIndex: mi, lessonIndex: li })),
      ),
    [course],
  )

  const [activeId, setActiveId] = useState(flat[0]?.lesson.id ?? "")
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(flat.filter((f) => f.lesson.completed).map((f) => f.lesson.id)),
  )

  const activeIdx = Math.max(
    0,
    flat.findIndex((f) => f.lesson.id === activeId),
  )
  const active = flat[activeIdx]

  const totalLessons = flat.length
  const completedCount = completed.size
  const pct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0
  const grade = toGrade(pct, true)

  function goToLesson(id: string) {
    setActiveId(id)
  }

  function goNext() {
    if (!active) return
    setCompleted((prev) => new Set(prev).add(active.lesson.id))
    const next = flat[activeIdx + 1]
    if (next) setActiveId(next.lesson.id)
  }

  const hasNext = activeIdx < flat.length - 1

  return (
    <div className="h-full overflow-y-auto bg-[#0B1120] px-4 py-5 md:px-6">
      {/* Membrete de la ficha */}
      <div className="mb-5 flex items-center gap-3 border-b border-[#2A3552] pb-3">
        <button
          onClick={onBack}
          aria-label="Volver a Cursos"
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2A3552] text-[#F5F3EC] transition-colors hover:border-[#C9A227]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-wide text-[#F5F3EC]">GRIP</span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[2px] text-[#8A93A8] sm:inline">
            Ficha de prospecto
          </span>
        </div>
        <span className="ml-auto font-serif text-[10px] uppercase tracking-[1.5px] text-[#8A93A8]">
          Temporada 2026 · Catcher
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* Columna izquierda: tarjeta-certificado con video */}
        <div className="flex flex-col self-start border border-[#C9A227]/60 bg-[#131C33]">
          <div className="flex items-center justify-between border-b border-[#2A3552] px-4 py-2.5">
            <span className="font-serif text-[10px] tracking-[1.5px] text-[#8A93A8]">GRIP · CERT #GR-0248-B2</span>
            <span className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#C9A227]">
              {pct >= 100 ? "Graduado" : "En curso"}
            </span>
          </div>

          <div className="p-3">
            {active ? (
              <MuxVideoPlayer key={active.lesson.id} playbackId={active.lesson.playbackId} title={active.lesson.title} className="w-full" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center border border-[#2A3552] bg-[#0B1120] text-sm text-[#8A93A8]">
                Esta lección aún no tiene video.
              </div>
            )}
          </div>

          {/* Pie: grado general + lección activa + siguiente */}
          <div className="border-t border-[#2A3552] px-4 py-4">
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8A93A8]">Grado general</span>
              <span className="flex items-baseline gap-1">
                <span className="font-serif text-4xl leading-none text-[#C9A227]">{grade.value}</span>
                <span className="font-serif text-sm text-[#8A93A8]">/80</span>
              </span>
            </div>

            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8A93A8]">En curso</div>
            <div className="mt-1 font-serif text-base leading-snug text-[#F5F3EC]">
              {active ? active.lesson.title : course.title}
            </div>

            <button
              onClick={goNext}
              disabled={!hasNext}
              className="mt-4 flex w-full min-h-11 items-center justify-center gap-2 bg-[#C9A227] px-4 py-3 text-[11px] font-bold uppercase tracking-[1.5px] text-[#0B1120] transition-colors hover:bg-[#d9b943] disabled:cursor-not-allowed disabled:border disabled:border-[#2A3552] disabled:bg-transparent disabled:text-[#5C6580]"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Columna derecha: escala + progresión + veredicto */}
        <div className="flex flex-col gap-4">
          <ScoutingScale grade={grade.value} />

          {/* Línea de progresión */}
          <section className="border border-[#2A3552] bg-[#131C33] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Línea de progresión</h2>
              <span className="truncate font-serif text-[10px] uppercase tracking-[1.5px] text-[#5C6580]">
                {course.title}
              </span>
            </div>

            {course.modules.map((m, mi) => (
              <div key={m.id} className="mb-4 last:mb-0">
                <div className="mb-2 font-serif text-[11px] uppercase tracking-[1.5px] text-[#C9A227]">
                  Módulo {String(mi + 1).padStart(2, "0")} — {m.title}
                </div>
                {m.lessons.length === 0 ? (
                  <p className="border border-dashed border-[#2A3552] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[1px] text-[#5C6580]">
                    Próximamente
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {m.lessons.map((l, li) => {
                      const isActive = l.id === activeId
                      const isDone = completed.has(l.id)
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => goToLesson(l.id)}
                            className={`flex w-full items-center justify-between gap-2 border px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? "border-[#C9A227]/60 bg-[#C9A227]/10"
                                : "border-[#2A3552] hover:border-[#3a445f]"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="font-serif text-[11px] text-[#8A93A8]">
                                {String(li + 1).padStart(2, "0")}
                              </span>
                              <span className={`truncate text-sm ${isActive ? "text-[#F5F3EC]" : "text-[#c7cdd6]"}`}>
                                {l.title}
                              </span>
                            </span>
                            <span className="shrink-0">
                              {isDone ? (
                                <Check className="h-4 w-4 text-[#C9A227]" strokeWidth={2.5} />
                              ) : isActive ? (
                                <span className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#C9A227]">
                                  Activo
                                </span>
                              ) : (
                                <span className="font-serif text-[10px] text-[#5C6580]">0/1</span>
                              )}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}

            {/* Barra de progreso del curso */}
            <div className="mt-4 border-t border-[#2A3552] pt-4">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[1.5px]">
                <span className="text-[#5C6580]">Progreso del curso</span>
                <span className="font-serif text-[#C9A227]">{pct}%</span>
              </div>
              <div className="h-[5px] w-full bg-[#2A3552]">
                <div className="h-full bg-[#C9A227] transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[1px] text-[#5C6580]">
                {completedCount}/{totalLessons} lecciones · Módulo {(active?.moduleIndex ?? 0) + 1}
              </div>
            </div>
          </section>

          <CoachVerdict pct={pct} />
        </div>
      </div>
    </div>
  )
}

/** Escala de scouting 20-80: perfil del prospecto (habilidades del catcher). */
function ScoutingScale({ grade }: { grade: number }) {
  const rows: { label: string; value: number; projection?: number; raw?: string }[] = [
    { label: "Blocking", value: 55, projection: 60 },
    { label: "Framing", value: 50 },
    { label: "Brazo / Pop Time", value: 55, raw: "1.94s" },
  ]

  return (
    <section className="border border-[#2A3552] bg-[#131C33] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Escala de scouting 20-80</h2>
        <span className="font-serif text-[10px] uppercase tracking-[1.5px] text-[#5C6580]">Gen {grade}/80</span>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-[#F5F3EC]">{r.label}</span>
            <div className="h-[5px] flex-1 bg-[#2A3552]">
              <div className="h-full bg-[#C9A227]" style={{ width: `${scoutFill(r.value)}%` }} />
            </div>
            <span className="w-16 shrink-0 text-right font-serif text-xs text-[#F5F3EC]">
              {r.raw ? r.raw : r.projection ? `${r.value} → ${r.projection}` : r.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Veredicto del coach — cambia según el avance del curso. */
function CoachVerdict({ pct }: { pct: number }) {
  const verdict =
    pct <= 0
      ? "Sin repeticiones registradas. Empieza el módulo para generar tu primera evaluación."
      : pct >= 100
        ? "Dominio completo del material. Listo para exigir el estándar en juego, con corredor en base."
        : "Progresión sólida. Manos suaves y setup silencioso: repite hasta que el movimiento sea automático."

  return (
    <section className="border border-[#2A3552] bg-[#131C33] p-4">
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Veredicto del coach</h2>
      <p className="text-sm leading-relaxed text-[#c7cdd6]">{verdict}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center border border-[#2A3552] font-serif text-[10px] text-[#C9A227]">
          CR
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#5C6580]">
          Coach Reyes · Evaluador GRIP
        </span>
      </div>
    </section>
  )
}

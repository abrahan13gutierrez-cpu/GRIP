"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"

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
  // Flatten lessons to navigate linearly
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
      {/* Header */}
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
          <span className="text-xs text-[#8A93A8]">· {course.title}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Columna principal: Reproductor de video + Navegación */}
        <div className="flex flex-col border border-[#2A3552] bg-[#131C33]">
          <div className="p-3 md:p-4">
            {active ? (
              <MuxVideoPlayer key={active.lesson.id} playbackId={active.lesson.playbackId} title={active.lesson.title} className="w-full" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center border border-[#2A3552] bg-[#0B1120] text-sm text-[#8A93A8]">
                Esta lección aún no tiene video.
              </div>
            )}
          </div>

          {/* Barra de control inferior: lección activa + botón siguiente */}
          <div className="border-t border-[#2A3552] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8A93A8]">En curso</div>
              <div className="mt-1 text-base font-medium text-[#F5F3EC]">
                {active ? active.lesson.title : course.title}
              </div>
            </div>

            <button
              onClick={goNext}
              disabled={!hasNext}
              className="flex min-h-11 items-center justify-center gap-2 bg-[#C9A227] px-5 py-2.5 text-xs font-bold uppercase tracking-[1.5px] text-[#0B1120] transition-colors hover:bg-[#d9b943] disabled:cursor-not-allowed disabled:border disabled:border-[#2A3552] disabled:bg-transparent disabled:text-[#5C6580]"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Columna lateral: Lista de módulos y lecciones + Progreso */}
        <div className="flex flex-col gap-4">
          <section className="border border-[#2A3552] bg-[#131C33] p-4">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#2A3552] pb-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A93A8]">Lecciones</h2>
              <span className="text-xs font-semibold text-[#C9A227]">{pct}% completado</span>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="h-[5px] w-full bg-[#2A3552]">
                <div className="h-full bg-[#C9A227] transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-[1px] text-[#5C6580]">
                {completedCount}/{totalLessons} lecciones completadas
              </div>
            </div>

            {course.modules.map((m, mi) => (
              <div key={m.id} className="mb-4 last:mb-0">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#C9A227]">
                  Módulo {String(mi + 1).padStart(2, "0")} — {m.title}
                </div>
                {m.lessons.length === 0 ? (
                  <p className="border border-dashed border-[#2A3552] px-3 py-2 text-[10px] font-semibold uppercase tracking-[1px] text-[#5C6580]">
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
                            className={`flex w-full items-center justify-between gap-2 border px-3 py-2 text-left transition-colors ${
                              isActive
                                ? "border-[#C9A227]/60 bg-[#C9A227]/10"
                                : "border-[#2A3552] hover:border-[#3a445f]"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="text-xs text-[#8A93A8]">
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
                              ) : null}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronRight, Link2, Search } from "lucide-react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"

/**
 * GRIP — Reproductor de lección reutilizable.
 * Recibe un `course` con módulos y lecciones y muestra el video a la izquierda
 * y el índice de lecciones a la derecha. Reutilizable por cualquier tarjeta de Cursos.
 * Paleta: fondo #0a0c0f, paneles #12151a / #171b21, línea #262b33, ámbar #ffb020.
 */

const OSWALD = "font-[family-name:var(--font-oswald)]"

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
  const [query, setQuery] = useState("")
  const [bookmarked, setBookmarked] = useState(false)

  const activeIdx = Math.max(
    0,
    flat.findIndex((f) => f.lesson.id === activeId),
  )
  const active = flat[activeIdx]
  const activeModule = active?.module

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
    <div className="flex h-full flex-col bg-[#0a0c0f]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 border-b border-[#262b33] px-4 py-3">
        <button
          onClick={onBack}
          aria-label="Volver a Cursos"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#262b33] text-[#eef1f5] transition-colors hover:border-[#3a424d]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <nav className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="truncate text-[#8a919c]">{course.title}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#4d545e]" />
          <span className="truncate text-[#8a919c]">{activeModule?.title}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#4d545e]" />
          <span className="truncate font-semibold text-[#eef1f5]">{active?.lesson.title}</span>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                void navigator.clipboard.writeText(
                  `${typeof window !== "undefined" ? window.location.href : ""}#${active?.lesson.id ?? ""}`,
                )
              }
            }}
            aria-label="Copiar enlace de la lección"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a919c] transition-colors hover:bg-[#171b21] hover:text-[#eef1f5]"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setBookmarked((b) => !b)}
            aria-label="Guardar lección"
            aria-pressed={bookmarked}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#171b21] ${
              bookmarked ? "text-[#ffb020]" : "text-[#8a919c] hover:text-[#eef1f5]"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Cuerpo: reproductor + panel */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Columna reproductor */}
        <div className="min-w-0 flex-1 overflow-y-auto p-4">
          {active ? (
            <MuxVideoPlayer
              key={active.lesson.id}
              playbackId={active.lesson.playbackId}
              title={active.lesson.title}
              className="w-full"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-[#262b33] bg-[#12151a] text-sm text-[#8a919c]">
              Esta lección aún no tiene video.
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b8905a]">
                {activeModule?.title}
              </div>
              <h1 className={`truncate text-lg text-[#eef1f5] ${OSWALD}`}>{active?.lesson.title}</h1>
            </div>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                hasNext
                  ? "bg-[#ffb020] text-[#0a0c0f] hover:bg-[#ffbe45]"
                  : "cursor-not-allowed border border-[#262b33] text-[#4d545e]"
              }`}
            >
              Siguiente lección
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Panel de lecciones */}
        <aside className="flex w-full shrink-0 flex-col border-t border-[#262b33] md:w-[340px] md:border-l md:border-t-0">
          <div className="border-b border-[#262b33] p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4d545e]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar lecciones"
                className="w-full rounded-lg border border-[#262b33] bg-[#12151a] py-2 pl-9 pr-3 text-sm text-[#eef1f5] outline-none placeholder:text-[#4d545e] focus:border-[#3a424d]"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {/* Resumen del curso */}
            <div className="mb-4 rounded-xl border border-[#262b33] bg-[#12151a] p-4">
              <div className={`text-sm text-[#eef1f5] ${OSWALD}`}>{active?.lesson.title ?? course.title}</div>
              <div className="mb-1.5 mt-3 flex items-center justify-between text-[11px]">
                <span className="uppercase tracking-wider text-[#4d545e]">{pct}% completado</span>
                <span className="font-semibold text-[#c7cdd6]">
                  {completedCount}/{totalLessons}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#262b33]">
                <div className="h-full rounded-full bg-[#ffb020] transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 text-[11px] text-[#8a919c]">
                Módulo {(active?.moduleIndex ?? 0) + 1} · {totalLessons} Lecciones
              </div>
            </div>

            {/* Módulos y lecciones */}
            {course.modules.map((m, mi) => {
              const lessons = m.lessons.filter((l) => l.title.toLowerCase().includes(query.toLowerCase()))
              if (lessons.length === 0) return null
              return (
                <div key={m.id} className="mb-4">
                  <h2 className={`mb-2 text-xs uppercase tracking-wide text-[#ffb020] ${OSWALD}`}>
                    Módulo {mi + 1} - {m.title}
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {lessons.map((l) => {
                      const isActive = l.id === activeId
                      const isDone = completed.has(l.id)
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => goToLesson(l.id)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? "border-[#ffb020]/50 bg-[#ffb020]/10"
                                : "border-[#262b33] bg-[#12151a] hover:border-[#3a424d]"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isDone
                                  ? "border-[#2fbf71] bg-[#2fbf71] text-[#0a0c0f]"
                                  : "border-[#3a424d] text-transparent"
                              }`}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <span
                              className={`min-w-0 flex-1 truncate text-sm ${
                                isActive ? "text-[#eef1f5]" : "text-[#c7cdd6]"
                              }`}
                            >
                              {l.title}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-[#4d545e]" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}

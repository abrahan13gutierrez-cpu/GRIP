"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Bookmark, Check, ChevronRight, Link2, ListVideo, X } from "lucide-react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"
import { LessonSidebar } from "@/components/dashboard/lesson-sidebar"
import { QuizCard, type LessonQuestion } from "@/components/dashboard/quiz-card"

/**
 * GRIP — Reproductor de lección (Vista 2).
 * Barra superior con migas de pan, contenido (video + texto + pregunta),
 * barra lateral de lecciones (cajón inferior en móvil) y botón "Próximo" fijo.
 */

export type Lesson = {
  id: string
  title: string
  playbackId: string
  completed?: boolean
  body?: string
  question?: LessonQuestion
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

export function LessonPlayer({
  course,
  onBack,
  onProgress,
}: {
  course: Course
  onBack: () => void
  onProgress?: (pct: number) => void
}) {
  // Aplana las lecciones para navegar linealmente entre módulos.
  const flat = useMemo(
    () => course.modules.flatMap((m, mi) => m.lessons.map((l) => ({ lesson: l, module: m, moduleIndex: mi }))),
    [course],
  )

  const [activeId, setActiveId] = useState(flat[0]?.lesson.id ?? "")
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(flat.filter((f) => f.lesson.completed).map((f) => f.lesson.id)),
  )
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeIdx = Math.max(0, flat.findIndex((f) => f.lesson.id === activeId))
  const active = flat[activeIdx]
  const pct = flat.length ? Math.round((completed.size / flat.length) * 100) : 0
  const hasNext = activeIdx < flat.length - 1

  // Cierra el cajón con Escape.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen])

  function complete(id: string) {
    if (completed.has(id)) return
    const next = new Set(completed).add(id)
    setCompleted(next)
    onProgress?.(Math.round((next.size / flat.length) * 100))
  }

  function answer(index: number) {
    if (!active) return
    setAnswers((prev) => ({ ...prev, [active.lesson.id]: index }))
    complete(active.lesson.id)
  }

  function select(id: string) {
    setActiveId(id)
    setDrawerOpen(false)
  }

  function goNext() {
    const next = flat[activeIdx + 1]
    if (next) setActiveId(next.lesson.id)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  function toggleBookmark() {
    if (!active) return
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(active.lesson.id)) next.delete(active.lesson.id)
      else next.add(active.lesson.id)
      return next
    })
  }

  const isBookmarked = active ? bookmarks.has(active.lesson.id) : false
  const isDone = active ? completed.has(active.lesson.id) : false

  const sidebar = (
    <LessonSidebar course={course} activeId={activeId} completed={completed} pct={pct} onSelect={select} />
  )

  return (
    <div className="flex h-full flex-col bg-[#0B1120]">
      {/* Barra superior */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#2A3552] px-3 md:px-4">
        <button
          onClick={onBack}
          aria-label="Volver a Cursos"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[#F5F3EC] transition-colors hover:text-[#C9A227]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <nav aria-label="Ruta" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            <li className="hidden shrink-0 text-[#8A93A8] md:block">Cursos</li>
            <li aria-hidden className="hidden text-[#5C6580] md:block">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="hidden min-w-0 truncate text-[#8A93A8] sm:block">{course.title}</li>
            {active && (
              <>
                <li aria-hidden className="hidden text-[#5C6580] lg:block">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li className="hidden min-w-0 truncate text-[#8A93A8] lg:block">{active.module.title}</li>
                <li aria-hidden className="hidden text-[#5C6580] sm:block">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li aria-current="page" className="min-w-0 truncate font-semibold text-[#F5F3EC]">
                  {active.lesson.title}
                </li>
              </>
            )}
          </ol>
        </nav>

        <button
          onClick={copyLink}
          aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[#C9A227] transition-colors hover:text-[#d9b943]"
        >
          {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleBookmark}
          disabled={!active}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? "Quitar marcador" : "Marcar lección"}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[#C9A227] transition-colors hover:text-[#d9b943] disabled:text-[#5C6580]"
        >
          <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Columna principal */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-y-auto">
            {active ? (
              // Una sola key por lección: al cambiar de lección se desmonta todo (video incluido).
              <div key={active.lesson.id} className="flex flex-col">
                <MuxVideoPlayer
                  playbackId={active.lesson.playbackId}
                  title={active.lesson.title}
                  variant="bleed"
                  className="w-full"
                />

                <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 md:px-8">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">
                      Módulo {active.moduleIndex + 1} · {active.module.title}
                    </div>
                    <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-balance text-[#F5F3EC]">
                      {active.lesson.title}
                    </h1>
                    {active.lesson.body && (
                      <p className="mt-3 text-[15px] leading-relaxed text-pretty text-[#c7cdd6]">{active.lesson.body}</p>
                    )}
                  </div>

                  {active.lesson.question ? (
                    <QuizCard
                      question={active.lesson.question}
                      selected={answers[active.lesson.id] ?? null}
                      onAnswer={answer}
                    />
                  ) : (
                    <button
                      onClick={() => complete(active.lesson.id)}
                      disabled={isDone}
                      className="flex min-h-11 items-center justify-center gap-2 self-start border border-[#2A3552] px-5 py-3 text-[11px] font-bold uppercase tracking-[1.5px] text-[#F5F3EC] transition-colors hover:border-[#C9A227] disabled:text-[#C9A227] disabled:hover:border-[#2A3552]"
                    >
                      <Check className="h-4 w-4" />
                      {isDone ? "Lección completada" : "Marcar como completada"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
                <div className="flex flex-col items-center justify-center border border-dashed border-[#2A3552] bg-[#131C33] px-6 py-20 text-center">
                  <p className="text-sm font-semibold text-[#F5F3EC]">Próximamente</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#8A93A8]">
                    Las lecciones de este curso se publicarán pronto.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Barra inferior fija */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#2A3552] px-4 py-3 md:px-6">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex min-h-11 items-center gap-2 border border-[#2A3552] px-4 text-sm font-semibold text-[#F5F3EC] transition-colors hover:border-[#C9A227] md:hidden"
            >
              <ListVideo className="h-4 w-4" />
              Lecciones
            </button>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className="ml-auto flex min-h-11 items-center gap-2 bg-[#C9A227] px-6 text-sm font-bold text-[#0B1120] transition-colors hover:bg-[#d9b943] disabled:cursor-not-allowed disabled:bg-[#2A3552] disabled:text-[#5C6580]"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Barra lateral (escritorio) */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-[#2A3552] md:block lg:w-80 xl:w-96">
          {sidebar}
        </aside>
      </div>

      {/* Cajón inferior (móvil/tablet) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Lecciones">
          <button
            aria-label="Cerrar lecciones"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-[#0B1120]/80"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col border-t border-[#2A3552] bg-[#0B1120]">
            <div className="flex items-center justify-between border-b border-[#2A3552] px-4 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Lecciones</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar"
                className="flex h-10 w-10 items-center justify-center text-[#F5F3EC]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto">{sidebar}</div>
          </div>
        </div>
      )}
    </div>
  )
}

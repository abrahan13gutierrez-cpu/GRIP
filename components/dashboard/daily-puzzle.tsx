"use client"

import { useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { QuizCard } from "@/components/dashboard/quiz-card"
import { DAILY_PUZZLES, todayPuzzleIndex } from "@/lib/dashboard/daily-puzzles"
import { awardXp } from "@/lib/status/client"

/**
 * Rompecabezas diario: una situación de juego por día, con feedback inmediato.
 * Se puede navegar a los rompecabezas anteriores para repasar.
 */
export function DailyPuzzleView({
  onBack,
  onProgress,
}: {
  onBack: () => void
  onProgress?: (pct: number) => void
}) {
  const [todayIdx] = useState(() => todayPuzzleIndex())
  const [offset, setOffset] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const total = DAILY_PUZZLES.length
  const idx = (todayIdx - offset + total) % total
  const puzzle = DAILY_PUZZLES[idx]
  const isToday = offset === 0
  const isAnswered = answers[puzzle.id] !== undefined
  const hasOlder = offset < total - 1

  const dateLabel = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(Date.now() - offset * 86_400_000),
  )

  function answer(index: number) {
    const next = { ...answers, [puzzle.id]: index }
    setAnswers(next)
    onProgress?.(Math.round((Object.keys(next).length / total) * 100))
    if (isToday) awardXp("daily_puzzle", new Date().toISOString().slice(0, 10))
  }

  const goOlder = () => setOffset((o) => Math.min(o + 1, total - 1))
  const goNewer = () => setOffset((o) => Math.max(o - 1, 0))

  const arrowClass =
    "flex h-10 w-10 items-center justify-center border border-[var(--hud-line)] text-[var(--hud-text)] transition-colors hover:border-[var(--hud-cyan)] hover:text-[var(--hud-cyan)] disabled:text-[var(--hud-muted)]/50 disabled:hover:border-[var(--hud-line)]"

  return (
    <div className="hud flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--hud-line)] bg-[var(--hud-bg-2)] px-3 md:px-4">
        <button
          onClick={onBack}
          aria-label="Volver a Cursos"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--hud-text)] transition-colors hover:text-[var(--hud-cyan)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <nav aria-label="Ruta" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            <li className="hidden shrink-0 text-[var(--hud-muted)] sm:block">Cursos</li>
            <li aria-hidden className="hidden text-[var(--hud-muted)] sm:block">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="min-w-0 truncate font-semibold">
              Rompecabezas diario
            </li>
          </ol>
        </nav>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 md:gap-10 md:px-8 md:py-10">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--hud-line)] pb-4">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hud-gold)]">
                {isToday ? "Reto de hoy" : "Reto anterior"} · {puzzle.topic}
              </div>
              <h1 className="mt-1.5 text-xl font-semibold capitalize tracking-tight md:text-2xl">{dateLabel}</h1>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={goOlder} disabled={!hasOlder} aria-label="Rompecabezas anterior" className={arrowClass}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goNewer} disabled={isToday} aria-label="Rompecabezas siguiente" className={arrowClass}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <QuizCard key={puzzle.id} question={puzzle} selected={answers[puzzle.id] ?? null} onAnswer={answer} />

          {isToday && isAnswered && (
            <p className="text-sm leading-relaxed text-[var(--hud-muted)] md:mx-12">
              Vuelve mañana para el siguiente rompecabezas, o repasa los anteriores.
            </p>
          )}
        </div>
      </main>

      <footer className="flex h-16 shrink-0 items-center justify-end border-t border-[var(--hud-line)] bg-[var(--hud-bg-2)] px-4 md:px-6">
        <button
          onClick={goOlder}
          disabled={!isAnswered || !hasOlder}
          className="hud-btn-gold flex h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold transition-[filter] hover:brightness-110"
        >
          Próximo
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </footer>
    </div>
  )
}

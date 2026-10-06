"use client"

import { useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { QuizCard } from "@/components/dashboard/quiz-card"
import { DAILY_PUZZLES, todayPuzzleIndex } from "@/lib/dashboard/daily-puzzles"

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

  const dateLabel = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(Date.now() - offset * 86_400_000),
  )

  function answer(index: number) {
    const next = { ...answers, [puzzle.id]: index }
    setAnswers(next)
    onProgress?.(Math.round((Object.keys(next).length / total) * 100))
  }

  return (
    <div className="flex h-full flex-col bg-[#0B1120]">
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
            <li className="hidden shrink-0 text-[#8A93A8] sm:block">Cursos</li>
            <li aria-hidden className="hidden text-[#5C6580] sm:block">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="min-w-0 truncate font-semibold text-[#F5F3EC]">
              Rompecabezas diario
            </li>
          </ol>
        </nav>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 md:px-8">
          <div className="flex items-end justify-between gap-4 border-b border-[#2A3552] pb-4">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A227]">
                {isToday ? "Reto de hoy" : "Reto anterior"} · {puzzle.topic}
              </div>
              <h1 className="mt-1.5 text-2xl font-bold capitalize tracking-tight text-[#F5F3EC]">{dateLabel}</h1>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setOffset((o) => Math.min(o + 1, total - 1))}
                disabled={offset >= total - 1}
                aria-label="Rompecabezas anterior"
                className="flex h-10 w-10 items-center justify-center border border-[#2A3552] text-[#F5F3EC] transition-colors hover:border-[#C9A227] disabled:text-[#5C6580] disabled:hover:border-[#2A3552]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOffset((o) => Math.max(o - 1, 0))}
                disabled={isToday}
                aria-label="Rompecabezas siguiente"
                className="flex h-10 w-10 items-center justify-center border border-[#2A3552] text-[#F5F3EC] transition-colors hover:border-[#C9A227] disabled:text-[#5C6580] disabled:hover:border-[#2A3552]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <QuizCard key={puzzle.id} question={puzzle} selected={answers[puzzle.id] ?? null} onAnswer={answer} />

          {isToday && answers[puzzle.id] !== undefined && (
            <p className="text-sm leading-relaxed text-[#8A93A8]">
              Vuelve mañana para el siguiente rompecabezas, o repasa los anteriores con las flechas.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

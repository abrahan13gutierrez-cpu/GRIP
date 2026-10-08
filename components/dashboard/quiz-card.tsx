"use client"

import { Check, X } from "lucide-react"

export type LessonQuestion = {
  prompt: string
  options: string[]
  correct: number
  explanation: string
}

type OptionState = "idle" | "chosen" | "correct" | "wrong" | "muted"

/**
 * Pregunta de situación de juego con feedback inmediato, en estilo HUD.
 * Responder (correcto o no) es lo que marca el reto como completado.
 */
export function QuizCard({
  question,
  selected,
  onAnswer,
  position = 1,
  total = 1,
}: {
  question: LessonQuestion
  selected: number | null
  onAnswer: (index: number) => void
  position?: number
  total?: number
}) {
  const answered = selected !== null
  const isCorrect = selected === question.correct

  function stateFor(i: number): OptionState {
    if (!answered) return "idle"
    if (i === question.correct) return "correct"
    if (i === selected) return "wrong"
    return "muted"
  }

  return (
    <section aria-labelledby="quiz-prompt" className="flex flex-col gap-10 md:gap-14">
      <div className="hud-frame hud-frame-gold px-5 pb-8 pt-4 md:px-10 md:pb-10">
        <div className="hud-label">
          Pregunta {position} / {total}
        </div>
        <h2
          id="quiz-prompt"
          className="mt-3 text-center text-lg font-semibold leading-snug text-balance md:text-2xl"
        >
          {question.prompt}
        </h2>
      </div>

      <div role="radiogroup" aria-labelledby="quiz-prompt" className="flex flex-col gap-4 md:px-12">
        {question.options.map((opt, i) => {
          const state = stateFor(i)
          const accent =
            state === "correct"
              ? "var(--hud-success)"
              : state === "wrong"
                ? "var(--hud-danger)"
                : "var(--hud-cyan)"
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={selected === i}
              disabled={answered}
              data-state={state}
              onClick={() => onAnswer(i)}
              className="hud-option hud-frame flex min-h-14 w-full items-center gap-4 px-3 py-3 text-left md:px-4"
            >
              <span
                aria-hidden
                style={{ borderColor: accent, color: accent }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold"
              >
                {state === "correct" ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : state === "wrong" ? (
                  <X className="h-4 w-4" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="text-[15px] leading-relaxed md:text-base">{opt}</span>
            </button>
          )
        })}
      </div>

      {answered && (
        <div aria-live="polite" className="border-t border-[var(--hud-line)] pt-5 md:mx-12">
          <div
            className="hud-label"
            style={{ color: isCorrect ? "var(--hud-success)" : "var(--hud-danger)" }}
          >
            {isCorrect ? "Correcto" : "Incorrecto"}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--hud-muted)] md:text-[15px]">
            {question.explanation}
          </p>
        </div>
      )}
    </section>
  )
}

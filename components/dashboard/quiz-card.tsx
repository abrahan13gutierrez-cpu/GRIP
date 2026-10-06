"use client"

import { Check, X } from "lucide-react"

export type LessonQuestion = {
  prompt: string
  options: string[]
  correct: number
  explanation: string
}

/**
 * Pregunta de situación de juego con feedback inmediato.
 * Responder (correcto o no) es lo que marca la lección como completada.
 */
export function QuizCard({
  question,
  selected,
  onAnswer,
}: {
  question: LessonQuestion
  selected: number | null
  onAnswer: (index: number) => void
}) {
  const answered = selected !== null
  const isCorrect = selected === question.correct

  return (
    <section aria-labelledby="quiz-prompt" className="border border-[#2A3552] bg-[#131C33] p-4 md:p-5">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Situación de juego</div>
      <h3 id="quiz-prompt" className="text-[15px] font-semibold leading-snug text-pretty text-[#F5F3EC]">
        {question.prompt}
      </h3>

      <div role="radiogroup" aria-labelledby="quiz-prompt" className="mt-4 flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const chosen = selected === i
          const showCorrect = answered && i === question.correct
          const showWrong = answered && chosen && !isCorrect
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={chosen}
              disabled={answered}
              onClick={() => onAnswer(i)}
              className={`flex min-h-11 items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-colors ${
                showCorrect
                  ? "border-[#C9A227] bg-[#C9A227]/10 text-[#F5F3EC]"
                  : showWrong
                    ? "border-[#8A93A8] text-[#8A93A8]"
                    : answered
                      ? "border-[#2A3552] text-[#5C6580]"
                      : "border-[#2A3552] text-[#F5F3EC] hover:border-[#C9A227]"
              }`}
            >
              <span>{opt}</span>
              {showCorrect && <Check className="h-4 w-4 shrink-0 text-[#C9A227]" strokeWidth={2.5} />}
              {showWrong && <X className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
            </button>
          )
        })}
      </div>

      {answered && (
        <div aria-live="polite" className="mt-4 border-t border-[#2A3552] pt-4">
          <div
            className={`text-[10px] font-semibold uppercase tracking-[2px] ${
              isCorrect ? "text-[#C9A227]" : "text-[#8A93A8]"
            }`}
          >
            {isCorrect ? "Correcto" : "Incorrecto"}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[#c7cdd6]">{question.explanation}</p>
        </div>
      )}
    </section>
  )
}

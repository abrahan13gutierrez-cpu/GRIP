"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Circle, Lock, Target } from "lucide-react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"
import { MuxUploader } from "@/components/mux/mux-uploader"
import type { FramingUnit } from "@/lib/framing/curriculum"
import { RECEIVING_VIDEOS, nextUnit, unitHref } from "@/lib/framing/curriculum"
import type { UnitStatus } from "@/lib/framing/progress"

/**
 * GRIP — Ciclo de una unidad de Framing: Video → Quiz → Práctica → Feedback.
 * Un único CTA dorado por paso (principio "una sola acción"). Misma paleta
 * del dosier de scouting: base #0B1120, superficie #131C33, borde #2A3552
 * (dorado #C9A227 activo), números/etiquetas en serif.
 */

type Step = "video" | "quiz" | "practice" | "feedback"

function stepOf(status: UnitStatus): Step {
  if (status === "video_pending") return "video"
  if (status === "video_complete" || status === "quiz_failed") return "quiz"
  if (status === "quiz_passed") return "practice"
  return "feedback"
}

const STEPS: { id: Step; label: string }[] = [
  { id: "video", label: "Video" },
  { id: "quiz", label: "Quiz" },
  { id: "practice", label: "Práctica" },
  { id: "feedback", label: "Feedback" },
]

type CycleNav = {
  /** When provided, the cycle runs embedded in the dashboard instead of as its own route. */
  onExit?: () => void
  onSelectUnit?: (unit: FramingUnit) => void
}

export function FramingCycle({
  unit,
  initialStatus,
  onExit,
  onSelectUnit,
}: { unit: FramingUnit; initialStatus: UnitStatus } & CycleNav) {
  const [status, setStatus] = useState<UnitStatus>(initialStatus)
  const [videoWatched, setVideoWatched] = useState(status !== "video_pending")
  const [saving, setSaving] = useState(false)
  const step = stepOf(status)
  const next = nextUnit(unit)

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.json().catch(() => ({}))
  }

  async function completeVideo() {
    setVideoWatched(true)
    setSaving(true)
    const result = await post("/api/framing/progress", {
      etapaSlug: unit.etapaSlug,
      subnivelSlug: unit.subnivelSlug,
      action: "video_complete",
    })
    setSaving(false)
    if (result.status) setStatus(result.status)
  }

  async function reportQuiz(passed: boolean) {
    setSaving(true)
    const result = await post("/api/framing/progress", {
      etapaSlug: unit.etapaSlug,
      subnivelSlug: unit.subnivelSlug,
      action: passed ? "quiz_pass" : "quiz_fail",
    })
    setSaving(false)
    if (result.status) setStatus(result.status)
  }

  async function submitPractice() {
    setSaving(true)
    const result = await post("/api/framing/practice", { etapaSlug: unit.etapaSlug, subnivelSlug: unit.subnivelSlug })
    setSaving(false)
    if (result.ok) setStatus("practice_submitted")
  }

  return (
    <div
      className={
        onExit ? "h-full overflow-y-auto bg-[#0B1120] px-4 py-5 md:px-6" : "min-h-dvh bg-[#0B1120] px-4 py-5 md:px-8"
      }
    >
      <div className="mx-auto max-w-5xl">
        {/* Membrete */}
        <div className="mb-5 flex items-center gap-3 border-b border-[#2A3552] pb-3">
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label="Volver a Cursos"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2A3552] text-[#F5F3EC] transition-colors hover:border-[#C9A227]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/dashboard"
              aria-label="Volver a Cursos"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2A3552] text-[#F5F3EC] transition-colors hover:border-[#C9A227]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-wide text-[#F5F3EC]">GRIP</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[2px] text-[#8A93A8] sm:inline">
              Framing
            </span>
          </div>
          <span className="ml-auto font-serif text-[10px] uppercase tracking-[1.5px] text-[#8A93A8]">
            Etapa {unit.etapaOrder}/5 · Unidad {unit.order}/5
          </span>
        </div>

        <header className="mb-5">
          <p className="font-serif text-[10px] uppercase tracking-[2px] text-[#C9A227]">{unit.etapaTitle}</p>
          <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight text-[#F5F3EC]">{unit.subnivelTitle}</h1>
          <p className="mt-1.5 max-w-2xl text-pretty text-sm leading-relaxed text-[#8A93A8]">{unit.objetivo}</p>
        </header>

        {/* Progreso del ciclo */}
        <ol className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const stepIdx = STEPS.findIndex((x) => x.id === step)
            const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "locked"
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center border font-serif text-xs ${
                    state === "done"
                      ? "border-[#C9A227] bg-[#C9A227] text-[#0B1120]"
                      : state === "active"
                        ? "border-[#C9A227] text-[#C9A227]"
                        : "border-[#2A3552] text-[#5C6580]"
                  }`}
                >
                  {state === "done" ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={`hidden text-[10px] font-semibold uppercase tracking-[1.5px] sm:inline ${
                    state === "locked" ? "text-[#5C6580]" : "text-[#F5F3EC]"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-[#2A3552]" />}
              </li>
            )
          })}
        </ol>

        {step === "video" && (
          <VideoStep unit={unit} watched={videoWatched} saving={saving} onEnded={completeVideo} onManual={completeVideo} />
        )}
        {step === "quiz" && <QuizStep unit={unit} saving={saving} failedOnce={status === "quiz_failed"} onResult={reportQuiz} />}
        {step === "practice" && <PracticeStep unit={unit} saving={saving} onSubmitted={submitPractice} />}
        {step === "feedback" && <FeedbackStep unit={unit} next={next} onExit={onExit} onSelectUnit={onSelectUnit} />}
      </div>
    </div>
  )
}

function StepCard({ children }: { children: React.ReactNode }) {
  return <section className="border border-[#2A3552] bg-[#131C33] p-5">{children}</section>
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-5 flex w-full min-h-11 items-center justify-center gap-2 bg-[#C9A227] px-4 py-3 text-[11px] font-bold uppercase tracking-[1.5px] text-[#0B1120] transition-colors hover:bg-[#d9b943] disabled:cursor-not-allowed disabled:bg-[#2A3552] disabled:text-[#5C6580]"
    >
      {children}
    </button>
  )
}

function VideoStep({
  unit,
  watched,
  saving,
  onEnded,
  onManual,
}: { unit: FramingUnit; watched: boolean; saving: boolean; onEnded: () => void; onManual: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    unit.video.playbackId ?? RECEIVING_VIDEOS[0]?.playbackId ?? null,
  )
  const selected = RECEIVING_VIDEOS.find((v) => v.playbackId === selectedId) ?? unit.video

  return (
    <StepCard>
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Paso 1 · Video</h2>
      {selected.playbackId ? (
        <MuxVideoPlayer
          key={selected.playbackId}
          playbackId={selected.playbackId}
          title={selected.title}
          onEnded={onEnded}
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-[#2A3552] bg-[#0B1120] text-center">
          <p className="text-sm font-medium text-[#F5F3EC]">Video pendiente de conexión</p>
          <p className="max-w-xs text-xs text-[#8A93A8]">
            Esta unidad quedará lista en cuanto se conecte el playback de Mux. Puedes avanzar manualmente.
          </p>
        </div>
      )}
      <div className="mt-4">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">
          Videos de Receiving · {RECEIVING_VIDEOS.length}
        </h3>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RECEIVING_VIDEOS.map((v, i) => {
            const active = v.playbackId === selected.playbackId
            return (
              <li key={v.playbackId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(v.playbackId)}
                  aria-pressed={active}
                  className={`flex w-full min-h-11 items-center gap-3 border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-[#C9A227] bg-[#0B1120] text-[#F5F3EC]"
                      : "border-[#2A3552] text-[#8A93A8] hover:border-[#C9A227] hover:text-[#F5F3EC]"
                  }`}
                >
                  <span className={`font-serif text-xs ${active ? "text-[#C9A227]" : "text-[#5C6580]"}`}>{i + 1}</span>
                  <span className="font-medium">{v.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <PrimaryButton onClick={onManual} disabled={saving || watched}>
        {watched ? "Video completado" : saving ? "Guardando…" : "Marcar video como visto"}
      </PrimaryButton>
    </StepCard>
  )
}

function QuizStep({
  unit,
  saving,
  failedOnce,
  onResult,
}: { unit: FramingUnit; saving: boolean; failedOnce: boolean; onResult: (passed: boolean) => void }) {
  const [answers, setAnswers] = useState<Array<number | null>>(() => unit.quiz.map(() => null))
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">(failedOnce ? "incorrect" : "idle")

  const allAnswered = answers.every((a) => a !== null)

  function select(qIdx: number, optIdx: number) {
    setAnswers((prev) => prev.map((a, i) => (i === qIdx ? optIdx : a)))
  }

  function submit() {
    const passed = unit.quiz.every((q, i) => answers[i] === q.correctIndex)
    setResult(passed ? "correct" : "incorrect")
    onResult(passed)
  }

  function retry() {
    setAnswers(unit.quiz.map(() => null))
    setResult("idle")
  }

  return (
    <StepCard>
      <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Paso 2 · Quiz</h2>
      <p className="mb-4 text-xs text-[#8A93A8]">Debes responder correctamente las 2 preguntas para desbloquear la práctica.</p>

      <div className="flex flex-col gap-5">
        {unit.quiz.map((q, qIdx) => (
          <div key={qIdx}>
            <p className="mb-2 text-sm font-medium leading-relaxed text-[#F5F3EC]">
              <span className="font-serif text-[#C9A227]">{qIdx + 1}.</span> {q.question}
            </p>
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt, optIdx) => {
                const selected = answers[qIdx] === optIdx
                const showCorrectness = result !== "idle"
                const isCorrect = optIdx === q.correctIndex
                return (
                  <button
                    key={optIdx}
                    onClick={() => result === "idle" && select(qIdx, optIdx)}
                    disabled={result !== "idle"}
                    className={`flex items-center gap-2.5 border px-3 py-2.5 text-left text-sm transition-colors ${
                      showCorrectness && isCorrect
                        ? "border-[#C9A227] bg-[#C9A227]/10 text-[#F5F3EC]"
                        : showCorrectness && selected && !isCorrect
                          ? "border-[#8A93A8] text-[#8A93A8]"
                          : selected
                            ? "border-[#C9A227] bg-[#C9A227]/10 text-[#F5F3EC]"
                            : "border-[#2A3552] text-[#c7cdd6] hover:border-[#3a445f]"
                    }`}
                  >
                    {selected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#C9A227]" strokeWidth={2.5} />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-[#5C6580]" strokeWidth={2} />
                    )}
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {result === "incorrect" ? (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[1px] text-[#8A93A8]">
            Aún no aprobado — revisa las respuestas correctas y vuelve a intentarlo. Puedes repetir el quiz las veces que quieras.
          </p>
          <PrimaryButton onClick={retry}>Reintentar quiz</PrimaryButton>
        </>
      ) : (
        <PrimaryButton onClick={submit} disabled={!allAnswered || saving}>
          {saving ? "Guardando…" : "Enviar quiz"}
        </PrimaryButton>
      )}
    </StepCard>
  )
}

function PracticeStep({ unit, saving, onSubmitted }: { unit: FramingUnit; saving: boolean; onSubmitted: () => void }) {
  const rows: { label: string; value: string }[] = [
    { label: "Practica lo que importa", value: unit.practica.habilidad },
    { label: "Hazlo representativo", value: unit.practica.representativo },
    { label: "Dosis", value: unit.practica.dosis },
    { label: "Haz que cada repetición cuente", value: unit.practica.criterio },
    { label: "Repetición sin repetición", value: unit.practica.variacion },
    { label: "Encuentra el desafío apropiado", value: unit.practica.desafio },
  ]

  return (
    <StepCard>
      <h2 className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">
        <Target className="h-3.5 w-3.5 text-[#C9A227]" /> Paso 3 · Práctica
      </h2>
      <p className="mb-4 text-xs text-[#8A93A8]">Ejecuta la repetición según este brief y sube tu video. Puedes repetir la práctica cuantas veces quieras.</p>

      <dl className="mb-5 flex flex-col gap-3 border border-[#2A3552] bg-[#0B1120] p-4">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#C9A227]">{r.label}</dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-[#c7cdd6]">{r.value}</dd>
          </div>
        ))}
      </dl>

      <MuxUploader
        kind="feedback"
        refId={`framing:${unit.etapaSlug}:${unit.subnivelSlug}`}
        label={saving ? "Guardando…" : "Subir mi práctica"}
        onUploadComplete={onSubmitted}
      />
    </StepCard>
  )
}

function FeedbackStep({
  unit,
  next,
  onExit,
  onSelectUnit,
}: { unit: FramingUnit; next: ReturnType<typeof nextUnit> } & CycleNav) {
  const secondaryClass =
    "mt-3 block w-full text-center text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8A93A8] hover:text-[#C9A227]"
  const primaryClass =
    "mt-2 flex w-full min-h-11 items-center justify-center gap-2 bg-[#C9A227] px-4 py-3 text-[11px] font-bold uppercase tracking-[1.5px] text-[#0B1120] transition-colors hover:bg-[#d9b943]"
  return (
    <StepCard>
      <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A93A8]">Paso 4 · Feedback</h2>
      <p className="mb-4 text-sm leading-relaxed text-[#c7cdd6]">
        Tu práctica de <span className="text-[#F5F3EC]">{unit.subnivelTitle}</span> quedó registrada. Tu coach dejará una
        nota en <span className="font-serif text-[#C9A227]">#feedback</span>; mientras tanto, ya puedes avanzar a la
        siguiente unidad.
      </p>

      <div className="border border-dashed border-[#2A3552] bg-[#0B1120] px-4 py-3 text-xs text-[#8A93A8]">
        Revisa tu autoevaluación contra el criterio de éxito de esta unidad:
        <span className="mt-1 block text-[#c7cdd6]">{unit.practica.criterio}</span>
      </div>

      {onExit ? (
        <button type="button" onClick={onExit} className={secondaryClass}>
          Volver a Cursos
        </button>
      ) : (
        <Link href="/dashboard" className={secondaryClass}>
          Ver #feedback en el chat
        </Link>
      )}

      {next ? (
        onSelectUnit ? (
          <button type="button" onClick={() => onSelectUnit(next)} className={primaryClass}>
            Siguiente unidad
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Link href={unitHref(next)} className={primaryClass}>
            Siguiente unidad
            <ArrowRight className="h-4 w-4" />
          </Link>
        )
      ) : (
        <div className="mt-2 flex w-full min-h-11 items-center justify-center gap-2 border border-[#2A3552] px-4 py-3 text-[11px] font-bold uppercase tracking-[1.5px] text-[#F5F3EC]">
          <Lock className="h-3.5 w-3.5 text-[#C9A227]" />
          Framing completo — 25/25 unidades
        </div>
      )}
    </StepCard>
  )
}

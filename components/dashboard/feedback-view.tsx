"use client"

import { useState } from "react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"
import { MuxUploader } from "@/components/mux/mux-uploader"
import { MessageSquare, CheckCircle2, Clock } from "lucide-react"

const OSWALD = "font-[family-name:var(--font-oswald)]"

// Mux public test asset — stands in for real clips until DB wiring lands.
const MOCK_PLAYBACK_ID = "qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpmaB00CUisJ4"

type FeedbackItem = {
  id: string
  skill: string
  file: string
  submitted: string
  status: "reviewed" | "pending"
  coachNote?: string
  playbackId: string
}

const INBOX: FeedbackItem[] = [
  {
    id: "f1",
    skill: "Stances 1.1",
    file: "clip_stances_08-28.mp4",
    submitted: "Hace 2 días",
    status: "reviewed",
    coachNote: "Buena base. Baja un poco el centro de gravedad y mantén la cabeza quieta en la transición.",
    playbackId: MOCK_PLAYBACK_ID,
  },
  {
    id: "f2",
    skill: "Blocking 1.2",
    file: "clip_blocking_08-29.mp4",
    submitted: "Ayer",
    status: "pending",
    playbackId: MOCK_PLAYBACK_ID,
  },
]

export function FeedbackView() {
  const [items, setItems] = useState<FeedbackItem[]>(INBOX)
  const [active, setActive] = useState<FeedbackItem>(INBOX[0])
  const [retryPlaybackId, setRetryPlaybackId] = useState<string | null>(null)

  const select = (item: FeedbackItem) => {
    setActive(item)
    setRetryPlaybackId(null)
  }

  return (
    <div className="h-full text-[#eef1f5]">
      <h1 className={`${OSWALD} mb-4 text-lg uppercase tracking-wide`}>Feedback</h1>

      <div className="flex h-[calc(100%-2.5rem)] flex-col gap-4 lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
        {/* INBOX */}
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto lg:h-full">
          {items.map((item) => {
            const isActive = active.id === item.id
            return (
              <button
                key={item.id}
                onClick={() => select(item)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#ffb020] bg-[#ffb020]/[.06]"
                    : "border-[#262b33] bg-[#12151a] hover:border-[#3a424d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`${OSWALD} text-sm uppercase tracking-wide`}>{item.skill}</span>
                  {item.status === "reviewed" ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[#2fbf71]">
                      <CheckCircle2 className="h-3 w-3" /> Revisado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[#ffb020]">
                      <Clock className="h-3 w-3" /> Pendiente
                    </span>
                  )}
                </div>
                <div className="mt-1 truncate font-mono text-[11px] text-[#4d545e]">{item.file}</div>
                <div className="mt-0.5 text-[11px] text-[#8a919c]">{item.submitted}</div>
              </button>
            )
          })}
        </div>

        {/* DETALLE */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-[#262b33] bg-[#12151a] p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className={`${OSWALD} text-base uppercase tracking-wide`}>{active.skill}</h2>
            <span className="font-mono text-[11px] text-[#4d545e]">{active.file}</span>
          </div>

          <div className="mb-4 mt-3">
            <MuxVideoPlayer playbackId={active.playbackId} title={active.file} />
          </div>

          {active.coachNote ? (
            <div className="mb-5 rounded-lg border border-[#262b33] bg-[#171b21] p-4">
              <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#ffb020]">
                <MessageSquare className="h-3.5 w-3.5" /> Nota del coach
              </div>
              <p className="text-[13px] leading-relaxed text-[#c7ccd4]">{active.coachNote}</p>
            </div>
          ) : (
            <div className="mb-5 rounded-lg border border-dashed border-[#262b33] bg-[#171b21] p-4 text-[13px] text-[#8a919c]">
              Aún sin revisar. Tu coach dejará una nota pronto.
            </div>
          )}

          {/* Grabar / subir reintento */}
          <div className="mt-auto border-t border-[#262b33] pt-4">
            <h4 className="mb-2 text-[11px] uppercase tracking-wider text-[#4d545e]">Grabar reintento</h4>
            {retryPlaybackId ? (
              <MuxVideoPlayer playbackId={retryPlaybackId} title="Mi reintento" />
            ) : (
              <MuxUploader
                kind="feedback"
                refId={active.id}
                label="Subir mi video"
                onUploadComplete={() => {
                  // Sin DB aún: mostramos un asset demo y marcamos el item como pendiente.
                  setRetryPlaybackId(MOCK_PLAYBACK_ID)
                  setItems((prev) =>
                    prev.map((it) => (it.id === active.id ? { ...it, status: "pending" } : it)),
                  )
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

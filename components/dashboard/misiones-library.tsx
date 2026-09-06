"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { X, Play, Check, RotateCcw } from "lucide-react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"

/**
 * GRIP — Misiones (librería de drills)
 * Mismo tema visual que CursosProtocol.
 */

const OSWALD = "font-[family-name:var(--font-oswald)]"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Fallback local de playback IDs; los reales vienen de la tabla `videos` (Mux).
const DRILL_PLAYBACK_IDS: Record<string, string> = {
  "Low Pitch Presentation": "s8Curbhz4dIc301FUabuAvDUg4vb7Y01uUKacIs2qAKWc",
}

type Drill = { id: number; cat: string; name: string; level: string }

const DRILL_NAMES: Record<string, string[]> = {
  Stances: [
    "Wall Sit Catcher", "3-Point Base Hold", "Mirror Drill", "Signal-to-Set Transition",
    "Low Base Hold 60s", "Hip Load Rock", "Quiet Head Drill", "Base Reset Reaction",
    "Stance Under Fatigue", "Weighted Vest Base",
  ],
  Blocking: [
    "Knee Slide Reps", "Chest-to-Ball Wall Drill", "Angle Block Series", "Short-Hop Machine",
    "Rapid Fire Blocks", "Block & Recover", "Two-Ball Block Combo", "Dirt Ball Reaction",
    "Block to Throw Transition", "Glove-Down Discipline", "Lateral Shuffle Block",
  ],
  Transfers: [
    "Quick Hands Partner Drill", "One-Knee Transfer", "Transfer Under Pressure",
    "Backhand Transfer Reps", "Silent Transfer (No Slap)", "Transfer Speed Ladder",
    "Blind Transfer Drill", "Two-Hand Sync Drill",
  ],
  Throwing: [
    "Pop Time Ladder", "Footwork Release Combo", "Snap Throw Reps", "Backpick Series",
    "Long Toss Progression", "Throwing on the Move", "1-2 Step Release",
    "Runner Read & React", "Throw-Down Accuracy Grid",
  ],
  Receiving: [
    "Framing Edge Drill", "Soft Hands Tee Work", "Low Pitch Presentation",
    "Glove Path Consistency", "One-Hand Receive Reps", "High Fastball Frame",
    "Backdoor Frame Series", "Presentation Under Velocity", "Called Strike Rate Drill",
  ],
  Mentalidad: [
    "Pre-Pitch Routine Build", "Reset After a Passed Ball", "Calling a Game Cold",
    "Body Language Under Pressure", "Between-Innings Reset", "Confidence Anchor Routine",
    "Failure Recovery Protocol", "Focus Reps — No Distraction Drill",
  ],
}

const LEVELS = ["Rookie", "Backstop", "Starter"]
const CATS = Object.keys(DRILL_NAMES)

function buildDrills(): Drill[] {
  const list: Drill[] = []
  let id = 1
  // Nivel determinista para evitar hydration mismatch (no Math.random en render).
  CATS.forEach((cat, catIdx) => {
    DRILL_NAMES[cat].forEach((name, i) => {
      list.push({ id: id++, cat, name, level: LEVELS[(catIdx + i) % LEVELS.length] })
    })
  })
  while (list.length < 62) {
    const cat = CATS[list.length % CATS.length]
    list.push({ id: id++, cat, name: `${cat} Combo Drill ${list.length}`, level: "Rookie" })
  }
  return list
}

export function MisionesLibrary() {
  const [drills] = useState<Drill[]>(buildDrills)
  const [activeCat, setActiveCat] = useState<string>("Todas")
  const [videoDrill, setVideoDrill] = useState<Drill | null>(null)

  const { data: videosData } = useSWR<{ videos: Record<string, string> }>("/api/videos", fetcher)
  const { data: progressData, mutate: mutateProgress } = useSWR<{ progress: Record<number, string> }>(
    "/api/progress/missions",
    fetcher,
  )

  // Los playback IDs reales (BD) tienen prioridad; el mapa local es respaldo.
  const playbackIds = useMemo(
    () => ({ ...DRILL_PLAYBACK_IDS, ...(videosData?.videos ?? {}) }),
    [videosData],
  )
  const progress = progressData?.progress ?? {}

  async function setStatus(drillId: number, status: "in_progress" | "completed" | "pending") {
    // Optimista: refleja el cambio al instante y confirma con el servidor.
    await mutateProgress(
      async () => {
        await fetch("/api/progress/missions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drillId, status }),
        })
        return { progress: { ...progress, [drillId]: status } }
      },
      { optimisticData: { progress: { ...progress, [drillId]: status } }, revalidate: true },
    )
  }

  function openDrill(d: Drill) {
    setVideoDrill(d)
    if (progress[d.id] !== "completed" && progress[d.id] !== "in_progress") {
      void setStatus(d.id, "in_progress")
    }
  }

  const filtered = useMemo(
    () => (activeCat === "Todas" ? drills : drills.filter((d) => d.cat === activeCat)),
    [drills, activeCat],
  )

  return (
    <div className="text-[#eef1f5]">
      <h1 className={`${OSWALD} mb-1 text-lg uppercase tracking-wide`}>Librería de Misiones</h1>
      <p className="mb-4 text-xs text-[#8a919c]">{drills.length} drills · filtra por skill o por problema</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Todas", ...CATS].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs
              ${
                activeCat === c
                  ? "border-[#ffb020] bg-[#ffb020] font-semibold text-[#0a0c0f]"
                  : "border-[#262b33] bg-[#12151a] text-[#8a919c]"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((d) => {
          const hasVideo = Boolean(playbackIds[d.name])
          const status = progress[d.id]
          return (
            <div
              key={d.id}
              onClick={hasVideo ? () => openDrill(d) : undefined}
              role={hasVideo ? "button" : undefined}
              tabIndex={hasVideo ? 0 : undefined}
              onKeyDown={
                hasVideo
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openDrill(d)
                      }
                    }
                  : undefined
              }
              className={`cursor-pointer rounded-xl border bg-[#12151a] p-4 transition hover:border-[#3f7bff] ${
                status === "completed" ? "border-[#2fbf71]/50" : "border-[#262b33]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#b8905a]">{d.cat}</div>
                {status === "completed" ? (
                  <span className="flex items-center gap-1 rounded-full bg-[#2fbf71]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2fbf71]">
                    <Check className="h-2.5 w-2.5" /> Hecho
                  </span>
                ) : status === "in_progress" ? (
                  <span className="rounded-full bg-[#ffb020]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#ffb020]">
                    En curso
                  </span>
                ) : null}
              </div>
              <div className={`${OSWALD} mb-2 mt-1.5 text-sm uppercase`}>{d.name}</div>
              <div className="min-h-[32px] text-xs leading-relaxed text-[#8a919c]">
                Misión asignable por el coach para atacar debilidades de {d.cat.toLowerCase()}.
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10.5px] text-[#4d545e]">
                {hasVideo ? (
                  <span className="flex items-center gap-1 font-semibold text-[#ffb020]">
                    <Play className="h-3 w-3 fill-current" />
                    VER VIDEO
                  </span>
                ) : (
                  <span>NIVEL {d.level.toUpperCase()}</span>
                )}
                <span>#{String(d.id).padStart(2, "0")}</span>
              </div>
            </div>
          )
        })}
      </div>

      {videoDrill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setVideoDrill(null)}
          role="dialog"
          aria-modal="true"
          aria-label={videoDrill.name}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-[#262b33] bg-[#0d1015] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#b8905a]">
                  {videoDrill.cat}
                </div>
                <h2 className={`${OSWALD} text-base uppercase`}>{videoDrill.name}</h2>
              </div>
              <button
                onClick={() => setVideoDrill(null)}
                aria-label="Cerrar"
                className="rounded-lg border border-[#262b33] p-1.5 text-[#8a919c] transition hover:border-[#3f7bff] hover:text-[#eef1f5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MuxVideoPlayer
              playbackId={playbackIds[videoDrill.name]}
              title={videoDrill.name}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              {progress[videoDrill.id] === "completed" ? (
                <button
                  onClick={() => setStatus(videoDrill.id, "in_progress")}
                  className="flex items-center gap-1.5 rounded-lg border border-[#262b33] px-3 py-2 text-sm font-semibold text-[#eef1f5] transition hover:border-[#3a424d]"
                >
                  <RotateCcw className="h-4 w-4" /> Reiniciar
                </button>
              ) : (
                <button
                  onClick={() => setStatus(videoDrill.id, "completed")}
                  className="flex items-center gap-1.5 rounded-lg bg-[#2fbf71] px-3 py-2 text-sm font-semibold text-[#0a0c0f] transition hover:bg-[#3fd382]"
                >
                  <Check className="h-4 w-4" /> Marcar como completada
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

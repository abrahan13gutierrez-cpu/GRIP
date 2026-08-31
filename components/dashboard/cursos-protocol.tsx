"use client"

import { useState } from "react"
import { MuxVideoPlayer } from "@/components/mux/mux-video-player"
import { MuxUploader } from "@/components/mux/mux-uploader"
import { LiveCallModal } from "@/components/daily/live-call-modal"
import { useLiveCall } from "@/components/daily/use-live-call"

/**
 * GRIP — Cursos (mapa de niveles / protocolo)
 * Paleta: fondo #0a0c0f, paneles #12151a / #171b21, línea #262b33,
 * ámbar #ffb020 (progreso/activo), verde #2fbf71 (aprobado), azul #3f7bff (en revisión)
 */

const OSWALD = "font-[family-name:var(--font-oswald)]"

// Mock coach-lesson playback id (Mux public test asset) until DB wiring lands.
const MOCK_LESSON_PLAYBACK_ID = "qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpmaB00CUisJ4"

type NodeStatus = "locked" | "open" | "done"
type RankStatus = "current" | "locked" | "done"

const RANKS: { key: string; name: string; tag: string; status: RankStatus }[] = [
  { key: "rookie", name: "Rookie", tag: "In the game", status: "current" },
  { key: "backstop", name: "Backstop", tag: "Handling the game", status: "locked" },
  { key: "starter", name: "Starter", tag: "Driving the game", status: "locked" },
  { key: "gamer", name: "Gamer", tag: "Changing the game", status: "locked" },
  { key: "captain", name: "Captain", tag: "Leading the game", status: "locked" },
  { key: "commander", name: "Commander", tag: "Commanding the game", status: "locked" },
]

const SKILLS = ["Stances", "Blocking", "Transfers", "Throwing", "Receiving"]
const SUBLEVELS = ["1.1", "1.2", "1.3", "1.4", "1.5"]

function makeInitialGrid(): NodeStatus[][] {
  const grid: NodeStatus[][] = SUBLEVELS.map((_, rowIdx) =>
    SKILLS.map(() => (rowIdx === 0 ? "open" : "locked")),
  )
  grid[0][0] = "open"
  return grid
}

function NodeIcon({ status }: { status: NodeStatus }) {
  if (status === "done") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-[#2fbf71]" fill="none" strokeWidth="2.4">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }
  if (status === "locked") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-[#4d545e]" fill="none" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    )
  }
  return (
    <div className="h-1 w-3/5 overflow-hidden rounded-full bg-[#262b33]">
      <div className="h-full w-2/5 bg-[#3f7bff]" />
    </div>
  )
}

export function CursosProtocol() {
  const [grid, setGrid] = useState<NodeStatus[][]>(makeInitialGrid)
  const [drawer, setDrawer] = useState<{ row: number; col: number } | null>(null)
  // playbackId of the catcher's just-uploaded attempt clip for the open cell
  const [uploadedPlaybackId, setUploadedPlaybackId] = useState<string | null>(null)
  const { roomUrl, loading: callLoading, startCall, closeCall } = useLiveCall()

  const openDrawer = (row: number, col: number) => {
    if (grid[row][col] === "locked") return
    setUploadedPlaybackId(null)
    setDrawer({ row, col })
  }

  const approveCurrent = () => {
    if (!drawer) return
    setGrid((g) => {
      const copy = g.map((r) => [...r])
      copy[drawer.row][drawer.col] = "done"
      if (drawer.col + 1 < SKILLS.length) {
        copy[drawer.row][drawer.col + 1] = "open"
      } else if (drawer.row + 1 < SUBLEVELS.length) {
        copy[drawer.row + 1][0] = "open"
      }
      return copy
    })
    setDrawer(null)
  }

  const doneCount = grid.flat().filter((s) => s === "done").length
  const total = SKILLS.length * SUBLEVELS.length
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div className="h-full text-[#eef1f5]">
      <h1 className={`${OSWALD} mb-4 text-lg uppercase tracking-wide`}>Rookie</h1>

      <div className="flex h-[calc(100%-2.5rem)] flex-col gap-4 lg:grid lg:grid-cols-[230px_1fr] lg:gap-6">
        {/* RIEL DE RANGOS */}
        <div className="flex flex-row gap-2 overflow-x-auto pb-1 lg:h-full lg:flex-col lg:overflow-visible">
          {RANKS.map((r) => (
            <div
              key={r.key}
              className={`flex min-w-[110px] flex-none flex-col justify-center rounded-xl border px-3.5 py-3 lg:min-w-0 lg:flex-1 lg:py-0
                ${r.status === "current" ? "border-[#ffb020] bg-[#ffb020]/[.06]" : ""}
                ${r.status === "done" ? "border-[#16512e]" : ""}
                ${r.status === "locked" ? "border-[#262b33] bg-[#12151a] opacity-40" : "border-[#262b33] bg-[#12151a]"}
              `}
            >
              <div
                className={`${OSWALD} text-sm font-semibold uppercase tracking-wide
                  ${r.status === "current" ? "text-[#ffb020]" : r.status === "done" ? "text-[#2fbf71]" : ""}`}
              >
                {r.name}
              </div>
              <div className="mt-0.5 hidden text-[10px] uppercase tracking-wider text-[#4d545e] sm:block">
                {r.tag}
              </div>
            </div>
          ))}
        </div>

        {/* TABLERO */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#262b33] bg-[#12151a]">
          <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#262b33] px-5 py-4">
            <div className={`${OSWALD} text-base uppercase tracking-wide`}>
              Rookie <span className="text-[#ffb020]">· In the Game</span>
            </div>
            <div className="font-mono text-[11px] text-[#8a919c]">
              {doneCount}/{total} CASILLAS · {pct}%
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="h-full w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-9 sm:w-14" />
                {SKILLS.map((s) => (
                  <col key={s} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th />
                  {SKILLS.map((s) => (
                    <th
                      key={s}
                      className="truncate py-2 text-[7px] font-semibold uppercase tracking-wider text-[#4d545e] sm:text-[10px]"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBLEVELS.map((sub, rowIdx) => (
                  <tr key={sub} className="h-1/5">
                    <td className="pl-1.5 font-mono text-[8px] text-[#4d545e] sm:pl-4 sm:text-[11px]">{sub}</td>
                    {SKILLS.map((_, colIdx) => {
                      const status = grid[rowIdx][colIdx]
                      return (
                        <td key={colIdx} className="p-1 sm:p-2">
                          <button
                            onClick={() => openDrawer(rowIdx, colIdx)}
                            aria-label={`${SKILLS[colIdx]} ${sub} — ${status}`}
                            className={`mx-auto flex aspect-[8/5] w-full max-w-[52px] items-center justify-center rounded-md border transition sm:max-w-[84px] sm:rounded-lg
                              ${status === "locked" ? "cursor-not-allowed border-[#262b33] bg-[#0d0f13]" : ""}
                              ${status === "open" ? "border-[#3f7bff] bg-[#151a22] shadow-[0_0_0_1px_#3f7bff_inset]" : ""}
                              ${status === "done" ? "border-[#16512e] bg-[#2fbf71]/[.08]" : ""}
                              ${status !== "locked" ? "hover:-translate-y-0.5" : ""}
                            `}
                          >
                            <NodeIcon status={status} />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-[#262b33] px-5 py-3 text-[10px] text-[#8a919c] sm:flex-row sm:gap-4 sm:text-[11px]">
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#3f7bff] align-middle" />En progreso
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#2fbf71] align-middle" />Aprobado
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#4d545e] align-middle" />Bloqueado
            </span>
          </div>
        </div>
      </div>

      {/* DRAWER DE CASILLA */}
      {drawer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={() => setDrawer(null)}
        >
          <div
            className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#262b33] bg-[#171b21]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#262b33] px-5 py-4">
              <div>
                <h2 className={`${OSWALD} text-lg uppercase`}>
                  {SKILLS[drawer.col]} {SUBLEVELS[drawer.row]}
                </h2>
                <div className="mt-1 font-mono text-[11px] text-[#4d545e]">ROOKIE</div>
              </div>
              <button
                onClick={() => setDrawer(null)}
                aria-label="Cerrar"
                className="text-xl leading-none text-[#8a919c]"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <h4 className="mb-2 text-[11px] uppercase tracking-wider text-[#4d545e]">Video del coach</h4>
              <div className="mb-4">
                <MuxVideoPlayer
                  playbackId={MOCK_LESSON_PLAYBACK_ID}
                  title={`${SKILLS[drawer.col]} ${SUBLEVELS[drawer.row]}`}
                />
              </div>

              <h4 className="mb-2 text-[11px] uppercase tracking-wider text-[#4d545e]">Qué se evalúa</h4>
              <ul className="space-y-2 text-[13px] text-[#8a919c]">
                <li className="flex gap-2">
                  <span className="text-[#ffb020]">▸</span>Base estable, 10 repeticiones limpias seguidas
                </li>
                <li className="flex gap-2">
                  <span className="text-[#ffb020]">▸</span>Transición fluida sin balanceo lateral
                </li>
              </ul>

              {/* Mi intento: sube un clip y, al terminar, se muestra reproducido */}
              <div className="mt-5">
                <h4 className="mb-2 text-[11px] uppercase tracking-wider text-[#4d545e]">Mi intento</h4>
                {uploadedPlaybackId ? (
                  <MuxVideoPlayer playbackId={uploadedPlaybackId} title="Mi intento" />
                ) : (
                  <MuxUploader
                    kind="feedback"
                    refId={`${SKILLS[drawer.col]}-${SUBLEVELS[drawer.row]}`}
                    label="Subir mi video"
                    onUploadComplete={() => {
                      // Sin DB aún: mostramos un asset demo como si fuera el recién subido.
                      setUploadedPlaybackId(MOCK_LESSON_PLAYBACK_ID)
                    }}
                  />
                )}
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={approveCurrent}
                  className="rounded-lg bg-[#ffb020] px-4 py-2.5 text-sm font-semibold text-[#0a0c0f]"
                >
                  Marcar como aprobado (demo)
                </button>
                <button
                  onClick={() => startCall(`cursos-${SKILLS[drawer.col]}-${SUBLEVELS[drawer.row]}`)}
                  disabled={callLoading}
                  className="rounded-lg border border-[#262b33] px-4 py-2.5 text-sm font-semibold text-[#eef1f5] transition-colors hover:border-[#3a424d] disabled:opacity-50"
                >
                  {callLoading ? "Creando sala..." : "Agendar llamada en vivo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {roomUrl && <LiveCallModal roomUrl={roomUrl} onClose={closeCall} />}
    </div>
  )
}

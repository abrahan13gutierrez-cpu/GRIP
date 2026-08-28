"use client"

import { useMemo, useState } from "react"

/**
 * GRIP — Misiones (librería de drills)
 * Mismo tema visual que CursosProtocol.
 */

const OSWALD = "font-[family-name:var(--font-oswald)]"

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
        {filtered.map((d) => (
          <div
            key={d.id}
            className="cursor-pointer rounded-xl border border-[#262b33] bg-[#12151a] p-4 transition hover:border-[#3f7bff]"
          >
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#b8905a]">{d.cat}</div>
            <div className={`${OSWALD} mb-2 mt-1.5 text-sm uppercase`}>{d.name}</div>
            <div className="min-h-[32px] text-xs leading-relaxed text-[#8a919c]">
              Misión asignable por el coach para atacar debilidades de {d.cat.toLowerCase()}.
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10.5px] text-[#4d545e]">
              <span>NIVEL {d.level.toUpperCase()}</span>
              <span>#{String(d.id).padStart(2, "0")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import {
  Rocket,
  Zap,
  Radio,
  Puzzle,
  Blocks,
  Brain,
  Handshake,
  Lock,
  ArrowLeft,
  Bookmark,
  type LucideIcon,
} from "lucide-react"
import { CursosProtocol } from "@/components/dashboard/cursos-protocol"
import { MisionesLibrary } from "@/components/dashboard/misiones-library"

/**
 * GRIP — Cursos (grid de carpetas/cursos)
 * Paleta app: fondo #0a0c0f, paneles #12151a / #171b21, línea #262b33, ámbar #ffb020
 * Las tarjetas "GRIP LEVEL UP" y "Bóveda del conocimiento" reutilizan los componentes
 * existentes (mapa de niveles y Librería de Misiones) sin duplicarlos.
 */

const OSWALD = "font-[family-name:var(--font-oswald)]"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Special = "protocol" | "misiones" | null

type CourseCard = {
  id: string
  title: string
  description?: string
  progress: number
  icon?: LucideIcon
  image?: string
  special?: Special
  accent?: boolean
}

const CARDS: CourseCard[] = [
  {
    id: "start",
    title: "Empieza aquí: ¿Qué es GRIP?",
    description: "Descubre cómo ganarás éxito.",
    progress: 100,
    icon: Rocket,
  },
  {
    id: "level-up",
    title: "GRIP LEVEL UP",
    description: "Ahora que ya conoces lo básico, es hora de ganar habilidad.",
    progress: 4,
    icon: Zap,
    special: "protocol",
    accent: true,
  },
  {
    id: "recordings",
    title: "Grabaciones de llamadas en directo",
    description: "Ponte al día con las valiosas capacitaciones en vivo que te perdiste.",
    progress: 0,
    icon: Radio,
  },
  {
    id: "boveda",
    title: "Bóveda del conocimiento",
    description: "Todas las habilidades adicionales, mini cursos y recursos que necesitarás durante el camino.",
    progress: 0,
    image: "/boveda-icon.png",
    special: "misiones",
  },
  {
    id: "daily-puzzle",
    title: "Rompecabezas diario",
    progress: 0,
    icon: Puzzle,
  },
  {
    id: "skill-puzzle",
    title: "Rompecabezas para el desarrollo de habilidades",
    progress: 0,
    icon: Blocks,
  },
  {
    id: "7-day",
    title: "Reto de 7 días para reconfigurar tu cerebro",
    description: "Lección breve + desafío diario para desvincularte de la matriz.",
    progress: 0,
    icon: Brain,
  },
  {
    id: "persuasion",
    title: "Persuasión avanzada",
    description:
      "Domina los secretos del catcher y la influencia para aumentar las buenas relaciones con los pitchers.",
    progress: 0,
    icon: Handshake,
  },
]

const TABS = [
  { id: "categorias", label: "Categorías" },
  { id: "en-curso", label: "En curso" },
  { id: "marcadores", label: "Marcadores" },
] as const

type TabId = (typeof TABS)[number]["id"]

// Una tarjeta está disponible si tiene progreso o es una tarjeta especial (recurso siempre accesible).
function isUnlocked(c: CourseCard) {
  return c.progress > 0 || c.special != null
}

export function CoursesView() {
  const [tab, setTab] = useState<TabId>("categorias")
  const [open, setOpen] = useState<Special>(null)

  const { data: progressData, mutate: mutateProgress } = useSWR<{ progress: Record<string, number> }>(
    "/api/progress/courses",
    fetcher,
  )
  const saved = progressData?.progress ?? {}

  // El progreso persistido (BD) tiene prioridad sobre el valor estático de la tarjeta.
  const cards = useMemo(
    () => CARDS.map((c) => ({ ...c, progress: saved[c.id] ?? c.progress })),
    [saved],
  )

  async function saveProgress(courseId: string, progress: number) {
    await mutateProgress(
      async () => {
        await fetch("/api/progress/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, progress }),
        })
        return { progress: { ...saved, [courseId]: progress } }
      },
      { optimisticData: { progress: { ...saved, [courseId]: progress } }, revalidate: true },
    )
  }

  function startCourse(card: CourseCard) {
    if (card.special) setOpen(card.special)
    // Registrar/persistir que el curso quedó en progreso (si aún no está avanzado).
    const current = saved[card.id] ?? card.progress
    if (current < 100 && current < 5) void saveProgress(card.id, Math.max(current, 5))
  }

  const visible = useMemo(() => {
    if (tab === "en-curso") return cards.filter((c) => c.progress > 0 && c.progress < 100)
    return cards
  }, [tab, cards])

  // Vista de detalle: monta el MISMO componente usado en el sidebar (sin duplicar).
  if (open) {
    return (
      <div className="flex h-full flex-col bg-[#0a0c0f]">
        <div className="flex items-center gap-3 border-b border-[#262b33] px-4 py-3">
          <button
            onClick={() => setOpen(null)}
            className="flex items-center gap-1.5 rounded-lg border border-[#262b33] px-3 py-1.5 text-sm font-medium text-[#eef1f5] transition-colors hover:border-[#3a424d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Cursos
          </button>
          <span className={`text-sm font-semibold uppercase tracking-wide text-[#8a919c] ${OSWALD}`}>
            {open === "protocol" ? "GRIP Level Up" : "Bóveda del conocimiento"}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {open === "protocol" ? <CursosProtocol /> : <MisionesLibrary />}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0a0c0f] px-4 py-5 md:px-6">
      <header className="mb-5">
        <h1 className={`text-2xl font-bold uppercase tracking-wide text-[#eef1f5] ${OSWALD}`}>Cursos</h1>
        <p className="mt-1 text-sm text-[#8a919c]">Tu recorrido completo de catcher, paso a paso.</p>
      </header>

      {/* Pestañas */}
      <div className="mb-6 flex gap-1 border-b border-[#262b33]">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "text-[#ffb020]" : "text-[#8a919c] hover:text-[#eef1f5]"
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#ffb020]" />}
            </button>
          )
        })}
      </div>

      {/* Marcadores: aún no hay lecciones guardadas */}
      {tab === "marcadores" ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#262b33] bg-[#12151a] px-6 py-16 text-center">
          <Bookmark className="mb-3 h-8 w-8 text-[#4d545e]" />
          <p className="text-sm font-medium text-[#eef1f5]">Aún no tienes marcadores</p>
          <p className="mt-1 max-w-xs text-xs text-[#8a919c]">
            Guarda lecciones como favoritas dentro de cada categoría y aparecerán aquí para acceso rápido.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#262b33] bg-[#12151a] px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#eef1f5]">No tienes cursos en progreso</p>
          <p className="mt-1 text-xs text-[#8a919c]">Empieza un curso desde la pestaña Categorías.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <CourseTile key={c.id} card={c} onStart={() => startCourse(c)} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseTile({ card, onStart }: { card: CourseCard; onStart: () => void }) {
  const unlocked = isUnlocked(card)
  const done = card.progress >= 100
  const Icon = card.icon

  return (
    <div
      className={`flex flex-col rounded-xl border bg-[#12151a] p-5 transition-colors ${
        card.accent ? "border-[#ffb020]/40 shadow-[0_0_0_1px_rgba(255,176,32,0.08)]" : "border-[#262b33]"
      }`}
    >
      {/* Ícono */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            card.image ? "bg-transparent" : card.accent ? "bg-[#ffb020]/15" : "bg-[#171b21]"
          }`}
        >
          {card.image ? (
            <Image
              src={card.image || "/placeholder.svg"}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          ) : Icon ? (
            <Icon className={`h-6 w-6 ${card.accent ? "text-[#ffb020]" : "text-[#c7cdd6]"}`} strokeWidth={2} />
          ) : null}
        </div>
        {done && (
          <span className="rounded-full bg-[#2fbf71]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2fbf71]">
            Completado
          </span>
        )}
      </div>

      {/* Texto */}
      <h3 className={`text-base font-bold leading-snug text-[#eef1f5] ${OSWALD}`}>{card.title}</h3>
      {card.description && <p className="mt-1.5 text-sm leading-relaxed text-[#8a919c]">{card.description}</p>}

      {/* Progreso */}
      <div className="mt-4 mb-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="uppercase tracking-wider text-[#4d545e]">Progreso</span>
          <span className="font-semibold text-[#c7cdd6]">{card.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#262b33]">
          <div className="h-full rounded-full bg-[#ffb020] transition-all" style={{ width: `${card.progress}%` }} />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        disabled={!unlocked}
        className={`mt-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          !unlocked
            ? "cursor-not-allowed border border-[#262b33] text-[#4d545e]"
            : card.accent
              ? "bg-[#ffb020] text-[#0a0c0f] hover:bg-[#ffbe45]"
              : "border border-[#262b33] text-[#eef1f5] hover:border-[#3a424d]"
        }`}
      >
        {!unlocked && <Lock className="h-3.5 w-3.5" />}
        {!unlocked ? "Bloqueado" : done ? "Repasar" : "Iniciar Curso"}
      </button>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import {
  Rocket,
  Radio,
  Puzzle,
  Blocks,
  Brain,
  Handshake,
  Library,
  Lock,
  Bookmark,
  Frame,
  type LucideIcon,
} from "lucide-react"
import { LessonPlayer, type Course } from "@/components/dashboard/lesson-player"
import { certNo, gradeStatus, toGrade } from "@/lib/dashboard/scouting"

// Placeholder de Mux hasta subir el video real de cada lección (reemplazar por su playbackId).
const PLACEHOLDER_PLAYBACK = "hDf4L01SaB1w4y4EjcgzTD6BjiNA4Ns9c7bWeYxwlccU"

// Contenido por curso. Cualquier tarjeta con entrada aquí abre el reproductor de lección.
const COURSE_CONTENT: Record<string, Course> = {
  start: {
    id: "start",
    title: "Empieza aquí: ¿Qué es GRIP?",
    modules: [
      {
        id: "m1",
        title: "Bienvenida",
        lessons: [
          { id: "start-l1", title: "¿Qué es GRIP?", playbackId: PLACEHOLDER_PLAYBACK, completed: true },
          { id: "start-l2", title: "Cómo usar la plataforma", playbackId: PLACEHOLDER_PLAYBACK, completed: true },
        ],
      },
    ],
  },
  // Bóveda del conocimiento: un módulo por área/skill (orden fijo). Los módulos sin
  // video real quedan vacíos y muestran "Próximamente" en el reproductor de lección.
  boveda: {
    id: "boveda",
    title: "Bóveda del conocimiento",
    modules: [
      { id: "stances", title: "Stances", lessons: [] },
      {
        id: "blocking",
        title: "Blocking",
        lessons: [
          { id: "blk-1", title: "Blocking Aqua Bag", playbackId: "hDf4L01SaB1w4y4EjcgzTD6BjiNA4Ns9c7bWeYxwlccU" },
          { id: "blk-2", title: "Blocking Stick", playbackId: "MZ2ANSYqKOJ934Mth8502TgxFH78DYa44rHC00XCicb3A" },
          {
            id: "blk-3",
            title: "Blocking Regular Glove",
            playbackId: "f00R3uJoRIK02bPXn3qmGMKHTpqMUxKjcVIx0200dRq8pMQ",
          },
        ],
      },
      { id: "transfers", title: "Transfers", lessons: [] },
      {
        id: "throwing",
        title: "Throwing",
        lessons: [
          { id: "thr-1", title: "Front Toss Plyo", playbackId: "FhItn8r864c9pkMlhcf00qmlo01RrhZHHQfFWkjOqYWyU" },
          { id: "thr-2", title: "Walk Back Plyo", playbackId: "8XluQaDkAQ4JUSrEa9zQ1oLJL9hDV3B4Ae22475WbpY" },
          { id: "thr-3", title: "Forward Walk Plyo", playbackId: "olvb6oJ9Ln8nUBL01q7oN2NNsp00kKzZBrPJlRYkoWO01E" },
          { id: "thr-4", title: "Circle Aquabag One Knee", playbackId: "M8gjtQcKwwJ5xJgZ9AfGaTPniuYj44dGl7gZUHsqpdo" },
        ],
      },
      // Receiving quedó vacío: sus drills se movieron al módulo "Framing" (curso propio).
      { id: "receiving", title: "Receiving", lessons: [] },
      { id: "mentalidad", title: "Mentalidad", lessons: [] },
    ],
  },
  // Framing: módulo propio con los drills de presentación/marco del guante.
  framing: {
    id: "framing",
    title: "Framing",
    modules: [
      {
        id: "framing-core",
        title: "Framing",
        lessons: [
          {
            id: "frm-1",
            title: "Resistance Band - Back",
            playbackId: "s8Curbhz4dIc301FUabuAvDUg4vb7Y01uUKacIs2qAKWc",
          },
          {
            id: "frm-2",
            title: "Assistance Resistance - Front",
            playbackId: "AhXTBI17FXLfIsa7z59HkYhxejZLUfHjTC02WPFshVPI",
          },
          { id: "frm-3", title: "CB Boz - Wrist Band", playbackId: "5nex2D3t4Sofw4Ayrqcj1Bgelufxj7Z7yQ6rTPYiDnc" },
        ],
      },
    ],
  },
}

/**
 * GRIP — Cursos, presentado como dosier de scouting.
 * Cada curso es una "tarjeta-certificado" calificada en la escala 20-80 (ver
 * lib/dashboard/scouting). Paleta: base #0B1120, superficie #131C33,
 * borde #2A3552 (dorado #C9A227 en activo/hover). Números en serif.
 */

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CourseCard = {
  id: string
  title: string
  description?: string
  progress: number
  icon: LucideIcon
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
    id: "recordings",
    title: "Grabaciones de llamadas en directo",
    description: "Ponte al día con las capacitaciones en vivo que te perdiste.",
    progress: 0,
    icon: Radio,
  },
  {
    id: "boveda",
    title: "Bóveda del conocimiento",
    description: "Habilidades adicionales, mini cursos y recursos que necesitarás.",
    progress: 0,
    icon: Library,
  },
  {
    id: "framing",
    title: "Framing",
    description: "Domina la presentación y el marco del guante para robar strikes.",
    progress: 0,
    icon: Frame,
  },
  {
    id: "daily-puzzle",
    title: "Rompecabezas diario",
    description: "Un reto corto cada día para afinar la lectura del juego.",
    progress: 0,
    icon: Puzzle,
  },
  {
    id: "skill-puzzle",
    title: "Rompecabezas para el desarrollo de habilidades",
    description: "Ejercicios enfocados para acelerar tu curva de aprendizaje.",
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
    description: "Domina los secretos del catcher y la influencia con los pitchers.",
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

// Una tarjeta está disponible si tiene progreso o tiene contenido de lección definido.
function isUnlocked(c: CourseCard) {
  return c.progress > 0 || COURSE_CONTENT[c.id] != null
}

export function CoursesView() {
  const [tab, setTab] = useState<TabId>("categorias")
  const [lesson, setLesson] = useState<Course | null>(null)

  const { data: progressData, mutate: mutateProgress } = useSWR<{ progress: Record<string, number> }>(
    "/api/progress/courses",
    fetcher,
  )
  const saved = progressData?.progress ?? {}

  // El progreso persistido (BD) tiene prioridad sobre el valor estático de la tarjeta.
  const cards = useMemo(() => CARDS.map((c) => ({ ...c, progress: saved[c.id] ?? c.progress })), [saved])

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
    if (COURSE_CONTENT[card.id]) setLesson(COURSE_CONTENT[card.id])
    // Registrar/persistir que el curso quedó en progreso (si aún no está avanzado).
    const current = saved[card.id] ?? card.progress
    if (current < 100 && current < 5) void saveProgress(card.id, Math.max(current, 5))
  }

  const visible = useMemo(() => {
    if (tab === "en-curso") return cards.filter((c) => c.progress > 0 && c.progress < 100)
    return cards
  }, [tab, cards])

  // Vista de lección: ficha de prospecto (reproductor + progresión + veredicto).
  if (lesson) {
    return <LessonPlayer course={lesson} onBack={() => setLesson(null)} />
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0B1120] px-4 py-5 md:px-6">
      {/* Membrete del dosier */}
      <div className="flex items-center justify-between border-b border-[#2A3552] pb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-wide text-[#F5F3EC]">GRIP</span>
          <span className="text-[10px] font-medium uppercase tracking-[2px] text-[#8A93A8]">Dosier de desarrollo</span>
        </div>
        <span className="font-serif text-[10px] uppercase tracking-[2px] text-[#C9A227]">Prospecto GR-0248</span>
      </div>

      <header className="mb-5 mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F3EC]">Cursos</h1>
        <p className="mt-1 text-sm text-[#8A93A8]">Tu recorrido completo de catcher, paso a paso.</p>
      </header>

      {/* Pestañas */}
      <div className="mb-6 flex gap-1 border-b border-[#2A3552]">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "text-[#C9A227]" : "text-[#8A93A8] hover:text-[#F5F3EC]"
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#C9A227]" />}
            </button>
          )
        })}
      </div>

      {/* Marcadores: aún no hay lecciones guardadas */}
      {tab === "marcadores" ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-[#2A3552] bg-[#131C33] px-6 py-16 text-center">
          <Bookmark className="mb-3 h-8 w-8 text-[#5C6580]" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#F5F3EC]">Aún no tienes marcadores</p>
          <p className="mt-1 max-w-xs text-xs text-[#8A93A8]">
            Guarda lecciones como favoritas dentro de cada categoría y aparecerán aquí para acceso rápido.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-[#2A3552] bg-[#131C33] px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#F5F3EC]">No tienes cursos en progreso</p>
          <p className="mt-1 text-xs text-[#8A93A8]">Empieza un curso desde la pestaña Categorías.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <CertificateCard key={c.id} card={c} index={CARDS.findIndex((x) => x.id === c.id)} onStart={() => startCourse(c)} />
          ))}
        </div>
      )}
    </div>
  )
}

function CertificateCard({ card, index, onStart }: { card: CourseCard; index: number; onStart: () => void }) {
  const unlocked = isUnlocked(card)
  const done = card.progress >= 100
  const grade = toGrade(card.progress, unlocked)
  const Icon = card.icon

  return (
    <article
      className={`group flex flex-col border bg-[#131C33] transition-colors ${
        unlocked ? "border-[#2A3552] hover:border-[#C9A227]" : "border-[#2A3552] opacity-55"
      }`}
    >
      {/* Barra superior: número de certificado + estado */}
      <div className="flex items-center justify-between border-b border-[#2A3552] px-4 py-2.5">
        <span className="font-serif text-[10px] tracking-[1.5px] text-[#8A93A8]">CERT #{certNo(index)}</span>
        <span
          className={`text-[9px] font-semibold uppercase tracking-[1.5px] ${
            grade.graded ? "text-[#C9A227]" : "text-[#5C6580]"
          }`}
        >
          {gradeStatus(grade)}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#2A3552]">
            <Icon className="h-5 w-5 text-[#8A93A8]" strokeWidth={1.5} />
          </div>
          <span className="font-serif text-[40px] leading-none text-[#F5F3EC]">{grade.graded ? grade.value : "—"}</span>
        </div>

        <h3 className="mt-4 text-[15px] font-semibold leading-snug text-balance text-[#F5F3EC]">{card.title}</h3>
        {card.description && <p className="mt-1.5 text-[13px] leading-relaxed text-[#8A93A8]">{card.description}</p>}

        {/* Progreso + acción, anclados al fondo */}
        <div className="mt-auto pt-4">
          <div className="h-[5px] w-full bg-[#2A3552]">
            <div className="h-full bg-[#C9A227] transition-all" style={{ width: `${card.progress}%` }} />
          </div>

          <button
            onClick={onStart}
            disabled={!unlocked}
            className={`mt-4 flex w-full min-h-11 items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[1.5px] transition-colors ${
              !unlocked
                ? "cursor-not-allowed border border-[#2A3552] text-[#5C6580]"
                : done
                  ? "border border-[#2A3552] text-[#F5F3EC] hover:border-[#C9A227]"
                  : "bg-[#C9A227] text-[#0B1120] hover:bg-[#d9b943]"
            }`}
          >
            {!unlocked && <Lock className="h-3.5 w-3.5" strokeWidth={2} />}
            {!unlocked ? "Bloqueado" : done ? "Repasar" : "Iniciar curso"}
          </button>
        </div>
      </div>
    </article>
  )
}

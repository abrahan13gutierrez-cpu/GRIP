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
  Frame,
  Shield,
  Target,
  Footprints,
  Gamepad2,
  ListOrdered,
  LayoutGrid,
  Loader,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Bell,
  CircleHelp,
  Search,
  MoreVertical,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { LessonPlayer, type Course } from "@/components/dashboard/lesson-player"
import { DailyPuzzleView } from "@/components/dashboard/daily-puzzle"

// Placeholder de Mux hasta subir el video real de cada lección (reemplazar por su playbackId).
const PLACEHOLDER_PLAYBACK = "hDf4L01SaB1w4y4EjcgzTD6BjiNA4Ns9c7bWeYxwlccU"

const BLOCKING_MODULE = {
  id: "blocking",
  title: "Blocking",
  lessons: [
    { id: "blk-1", title: "Blocking Aqua Bag", playbackId: "hDf4L01SaB1w4y4EjcgzTD6BjiNA4Ns9c7bWeYxwlccU" },
    { id: "blk-2", title: "Blocking Stick", playbackId: "MZ2ANSYqKOJ934Mth8502TgxFH78DYa44rHC00XCicb3A" },
    { id: "blk-3", title: "Blocking Regular Glove", playbackId: "f00R3uJoRIK02bPXn3qmGMKHTpqMUxKjcVIx0200dRq8pMQ" },
  ],
}

const THROWING_MODULE = {
  id: "throwing",
  title: "Throwing",
  lessons: [
    { id: "thr-1", title: "Front Toss Plyo", playbackId: "FhItn8r864c9pkMlhcf00qmlo01RrhZHHQfFWkjOqYWyU" },
    { id: "thr-2", title: "Walk Back Plyo", playbackId: "8XluQaDkAQ4JUSrEa9zQ1oLJL9hDV3B4Ae22475WbpY" },
    { id: "thr-3", title: "Forward Walk Plyo", playbackId: "olvb6oJ9Ln8nUBL01q7oN2NNsp00kKzZBrPJlRYkoWO01E" },
    { id: "thr-4", title: "Circle Aquabag One Knee", playbackId: "M8gjtQcKwwJ5xJgZ9AfGaTPniuYj44dGl7gZUHsqpdo" },
  ],
}

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
  boveda: {
    id: "boveda",
    title: "Bóveda del conocimiento",
    modules: [BLOCKING_MODULE, THROWING_MODULE],
  },
  blocking: { id: "blocking", title: "Blocking", modules: [BLOCKING_MODULE] },
  throwing: { id: "throwing", title: "Throwing", modules: [THROWING_MODULE] },
  framing: {
    id: "framing",
    title: "Framing",
    modules: [
      {
        id: "framing-core",
        title: "Framing",
        lessons: [
          { id: "frm-1", title: "Resistance Band - Back", playbackId: "s8Curbhz4dIc301FUabuAvDUg4vb7Y01uUKacIs2qAKWc" },
          { id: "frm-2", title: "Assistance Resistance - Front", playbackId: "AhXTBI17FXLfIsa7z59HkYhxejZLUfHjTC02WPFshVPI" },
          { id: "frm-3", title: "CB Boz - Wrist Band", playbackId: "5nex2D3t4Sofw4Ayrqcj1Bgelufxj7Z7yQ6rTPYiDnc" },
        ],
      },
    ],
  },
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CourseCategory = "Fundamentos" | "Rompecabezas" | "Juego" | "Recursos"

type CourseCard = {
  id: string
  title: string
  description?: string
  icon: LucideIcon
  category: CourseCategory
  progress: number
}

const CATEGORY_ORDER: CourseCategory[] = ["Fundamentos", "Rompecabezas", "Juego", "Recursos"]

// Para agregar un curso nuevo basta con sumar una entrada aquí.
const COURSES: CourseCard[] = [
  { id: "start", title: "Empieza aquí: ¿Qué es GRIP?", description: "Descubre cómo vas a crecer como catcher.", icon: Rocket, category: "Fundamentos", progress: 100 },
  { id: "recordings", title: "Grabaciones de llamadas en directo", description: "Ponte al día con las capacitaciones en vivo.", icon: Radio, category: "Fundamentos", progress: 0 },
  { id: "framing", title: "Framing", description: "Domina la presentación y el marco del guante para robar strikes.", icon: Frame, category: "Rompecabezas", progress: 0 },
  { id: "blocking", title: "Blocking", description: "Bloquea pitcheos en la tierra y protege el plato.", icon: Shield, category: "Rompecabezas", progress: 0 },
  { id: "throwing", title: "Throwing", description: "Transferencia rápida y tiros precisos a las bases.", icon: Target, category: "Rompecabezas", progress: 0 },
  { id: "stance", title: "Stance", description: "Postura base y con corredores para cada situación.", icon: Footprints, category: "Rompecabezas", progress: 0 },
  { id: "daily-puzzle", title: "Rompecabezas diario", description: "Un reto corto cada día para afinar la lectura del juego.", icon: Puzzle, category: "Rompecabezas", progress: 0 },
  { id: "skill-puzzle", title: "Rompecabezas para el desarrollo de habilidades", description: "Ejercicios enfocados para acelerar tu aprendizaje.", icon: Blocks, category: "Rompecabezas", progress: 0 },
  { id: "game-situations", title: "Situaciones de juego", description: "Decisiones reales con corredores, outs y conteo.", icon: Gamepad2, category: "Juego", progress: 0 },
  { id: "pitch-sequence", title: "Pitch Sequence", description: "Construye secuencias para dominar a cada bateador.", icon: ListOrdered, category: "Juego", progress: 0 },
  { id: "boveda", title: "Bóveda del conocimiento", description: "Mini cursos y recursos adicionales que necesitarás.", icon: Library, category: "Recursos", progress: 0 },
  { id: "7-day", title: "Reto de 7 días para reconfigurar tu cerebro", description: "Lección breve + desafío diario de mentalidad.", icon: Brain, category: "Recursos", progress: 0 },
  { id: "persuasion", title: "Persuasión avanzada", description: "La influencia del catcher con sus pitchers.", icon: Handshake, category: "Recursos", progress: 0 },
]

const TABS = [
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "en-curso", label: "En curso", icon: Loader },
  { id: "marcadores", label: "Marcadores", icon: Bookmark },
] as const

type TabId = (typeof TABS)[number]["id"]

function courseFor(card: CourseCard): Course {
  return (
    COURSE_CONTENT[card.id] ?? {
      id: card.id,
      title: card.title,
      modules: [{ id: `${card.id}-m1`, title: "Contenido", lessons: [] }],
    }
  )
}

export function CoursesView() {
  const [tab, setTab] = useState<TabId>("categorias")
  const [lesson, setLesson] = useState<Course | null>(null)
  const [puzzleOpen, setPuzzleOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set())

  const { data: progressData, mutate: mutateProgress } = useSWR<{ progress: Record<string, number> }>(
    "/api/progress/courses",
    fetcher,
  )
  const saved = progressData?.progress ?? {}

  // El progreso persistido (BD) tiene prioridad sobre el valor estático de la tarjeta.
  const cards = useMemo(() => COURSES.map((c) => ({ ...c, progress: saved[c.id] ?? c.progress })), [saved])

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
    if (card.id === "daily-puzzle") {
      setPuzzleOpen(true)
      return
    }
    setLesson(courseFor(card))
    const current = saved[card.id] ?? card.progress
    if (current < 100 && current < 5) void saveProgress(card.id, Math.max(current, 5))
  }

  function handleLessonProgress(courseId: string, pct: number) {
    const current = saved[courseId] ?? 0
    if (pct > current) void saveProgress(courseId, pct)
  }

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (puzzleOpen) {
    return (
      <DailyPuzzleView
        onBack={() => setPuzzleOpen(false)}
        onProgress={(pct) => handleLessonProgress("daily-puzzle", pct)}
      />
    )
  }

  if (lesson) {
    return (
      <LessonPlayer
        course={lesson}
        onBack={() => setLesson(null)}
        onProgress={(pct) => handleLessonProgress(lesson.id, pct)}
      />
    )
  }

  const renderGrid = (list: CourseCard[]) => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {list.map((c) => (
        <CourseTile
          key={c.id}
          card={c}
          bookmarked={bookmarks.has(c.id)}
          onToggleBookmark={() => toggleBookmark(c.id)}
          onStart={() => startCourse(c)}
        />
      ))}
    </div>
  )

  let body: React.ReactNode
  if (tab === "categorias") {
    body = (
      <div className="flex flex-col gap-10">
        {CATEGORY_ORDER.map((cat) => {
          const list = cards.filter((c) => c.category === cat)
          if (list.length === 0) return null
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`} className="flex flex-col gap-4">
              <h2 id={`cat-${cat}`} className="hud-label text-[color:var(--grip-gold)]">
                {cat}
              </h2>
              {renderGrid(list)}
            </section>
          )
        })}
      </div>
    )
  } else {
    const list =
      tab === "en-curso"
        ? cards.filter((c) => c.progress > 0 && c.progress < 100)
        : cards.filter((c) => bookmarks.has(c.id))
    body =
      list.length > 0 ? (
        renderGrid(list)
      ) : (
        <EmptyState
          title={tab === "en-curso" ? "No tienes cursos en progreso" : "Aún no tienes marcadores"}
          text={
            tab === "en-curso"
              ? "Empieza un curso desde la pestaña Categorías."
              : "Usa el menú ⋮ de cualquier curso para guardarlo aquí."
          }
        />
      )
  }

  return (
    <div className="hud h-full overflow-y-auto rounded-xl bg-[color:var(--grip-bg)]">
      <LearningHeader />
      <div className="flex flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <div role="tablist" aria-label="Filtrar cursos" className="grid grid-cols-3 gap-2 md:gap-4">
          {TABS.map((t) => {
            const active = tab === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex h-12 items-center justify-center gap-2 rounded-lg px-2 text-sm transition-colors md:h-14 md:text-base ${
                  active
                    ? "bg-[color:var(--grip-gold)] font-semibold text-[color:var(--grip-bg)]"
                    : "bg-[color:var(--grip-tab)] font-medium text-[color:var(--hud-text)] hover:bg-[#15233a]"
                }`}
              >
                <Icon className="hidden h-5 w-5 sm:block" strokeWidth={1.75} aria-hidden="true" />
                {t.label}
              </button>
            )
          })}
        </div>
        {body}
      </div>
    </div>
  )
}

function LearningHeader() {
  const iconBtn =
    "relative flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--hud-text)] transition-colors hover:bg-[color:var(--grip-tab)]"
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[color:var(--grip-line)] bg-[color:var(--grip-bg)] px-4 py-3 md:px-6">
      <button className="flex min-w-0 items-center gap-2 text-left">
        <span className="truncate text-lg font-semibold text-[color:var(--hud-text)] md:text-2xl">
          Centro de aprendizaje
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-[color:var(--hud-muted)]" aria-hidden="true" />
      </button>
      <div className="flex items-center gap-1">
        <button className={`${iconBtn} hidden sm:flex`} aria-label="Calendario">
          <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button className={iconBtn} aria-label="Notificaciones (nuevas)">
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[color:var(--hud-danger)]" />
        </button>
        <button className={`${iconBtn} hidden sm:flex`} aria-label="Ayuda">
          <CircleHelp className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button className={iconBtn} aria-label="Buscar cursos">
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <span className="mx-2 hidden h-6 w-px bg-[color:var(--grip-line)] md:block" />
        <button className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-[color:var(--grip-tab)] md:px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--grip-gold-deep)] bg-[color:var(--grip-tab)]">
            <UserRound className="h-5 w-5 text-[color:var(--grip-gold)]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="hidden text-sm font-medium text-[color:var(--hud-text)] lg:block">Mi perfil</span>
          <ChevronDown className="hidden h-4 w-4 text-[color:var(--hud-muted)] lg:block" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function CourseTile({
  card,
  bookmarked,
  onToggleBookmark,
  onStart,
}: {
  card: CourseCard
  bookmarked: boolean
  onToggleBookmark: () => void
  onStart: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const Icon = card.icon
  const progress = Math.round(card.progress)
  const cta = progress >= 100 ? "Repasar" : progress > 0 ? "Continuar" : "Iniciar Curso"

  return (
    <article className="group relative flex flex-col gap-6 rounded-xl border border-[color:var(--grip-line)] bg-[color:var(--grip-card)] p-6 shadow-[0_8px_24px_rgb(0_0_0/0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--grip-gold-deep)]">
      <div className="absolute right-3 top-3">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={`Opciones de ${card.title}`}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--hud-muted)] transition-colors hover:bg-[color:var(--grip-tab)] hover:text-[color:var(--hud-text)]"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-[color:var(--grip-line)] bg-[color:var(--grip-tab)] p-1 shadow-xl">
            <button
              onClick={() => {
                onToggleBookmark()
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[color:var(--hud-text)] hover:bg-[#1a2a44]"
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-[color:var(--grip-gold)]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {bookmarked ? "Quitar de marcadores" : "Guardar en marcadores"}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-5 pr-8">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center md:h-24 md:w-24">
          <Icon className="h-12 w-12 text-[color:var(--grip-gold)] md:h-16 md:w-16" strokeWidth={1.4} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-lg font-semibold leading-snug text-balance text-[color:var(--hud-text)] md:text-xl">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-sm leading-relaxed text-pretty text-[color:var(--hud-muted)]">{card.description}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de ${card.title}`}
          className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--grip-track)]"
        >
          <div
            className="h-full rounded-full bg-[color:var(--grip-gold-deep)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-[color:var(--hud-muted)]">{progress} % completado</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onStart}
          className="flex min-h-11 items-center gap-3 rounded-md bg-[color:var(--grip-gold)] px-6 py-3 text-base font-semibold text-[color:var(--grip-bg)] shadow-[0_4px_12px_rgb(212_162_76/0.25)] transition-[filter] hover:brightness-105"
        >
          {cta}
          <ChevronRight className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--grip-line)] bg-[color:var(--grip-card)] px-6 py-16 text-center">
      <Bookmark className="h-8 w-8 text-[color:var(--hud-muted)]" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-sm font-medium text-[color:var(--hud-text)]">{title}</p>
      <p className="max-w-xs text-sm text-[color:var(--hud-muted)]">{text}</p>
    </div>
  )
}

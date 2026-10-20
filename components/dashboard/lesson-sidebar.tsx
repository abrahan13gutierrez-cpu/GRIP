"use client"

import { useMemo, useState } from "react"
import { Check, ChevronRight, Search } from "lucide-react"
import type { Course } from "@/components/dashboard/lesson-player"

/**
 * Barra lateral del reproductor: buscador, resumen del curso y lista de
 * lecciones agrupadas por módulo. La lección activa lleva borde dorado a la izquierda.
 */
export function LessonSidebar({
  course,
  activeId,
  completed,
  onSelect,
}: {
  course: Course
  activeId: string
  completed: Set<string>
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")

  const modules = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return course.modules
    return course.modules
      .map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.title.toLowerCase().includes(q)) }))
      .filter((m) => m.lessons.length > 0)
  }, [course.modules, query])

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      <label className="relative block">
        <span className="sr-only">Buscar lecciones</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar lecciones"
          className="h-10 w-full border border-[#2A3552] bg-[#0B1120] pl-3 pr-9 text-sm text-[#F5F3EC] placeholder:text-[#5C6580] focus:border-[#C9A227] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6580]" />
      </label>

      {/* Módulos y lecciones */}
      <nav aria-label="Lecciones del curso" className="flex flex-col gap-4">
        {modules.length === 0 && <p className="px-1 text-sm text-[#8A93A8]">Sin resultados para “{query}”.</p>}
        {modules.map((m) => {
          const moduleIndex = course.modules.findIndex((x) => x.id === m.id)
          return (
            <section key={m.id}>
              <h3 className="border-b border-[#2A3552] px-1 pb-2 text-sm font-semibold text-[#F5F3EC]">
                Módulo {moduleIndex + 1} – {m.title}
              </h3>
              {m.lessons.length === 0 ? (
                <p className="mt-2 border border-dashed border-[#2A3552] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[1px] text-[#5C6580]">
                  Próximamente
                </p>
              ) : (
                <ul className="mt-1 flex flex-col">
                  {m.lessons.map((l) => {
                    const isActive = l.id === activeId
                    const isDone = completed.has(l.id)
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => onSelect(l.id)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left transition-colors ${
                            isActive
                              ? "border-[#C9A227] bg-[#131C33]"
                              : "border-transparent hover:bg-[#131C33]/60"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-6 w-6 shrink-0 items-center justify-center border ${
                              isDone ? "border-[#C9A227] text-[#C9A227]" : "border-[#2A3552]"
                            }`}
                          >
                            {isDone && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-[#F5F3EC]">{l.title}</span>
                            <span className="block text-xs text-[#8A93A8]">
                              1 video
                              <span className="sr-only">{isDone ? ", completada" : ", pendiente"}</span>
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#5C6580]" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </nav>
    </div>
  )
}

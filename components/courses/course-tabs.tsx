'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bookmark, LayoutGrid, RotateCw } from 'lucide-react'
import { COURSES, type Course } from '@/data/courses'
import { CourseCard } from '@/components/courses/course-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TabId = 'categorias' | 'en-curso' | 'marcadores'

const TABS: { id: TabId; label: string; icon: LucideIcon; empty: string }[] = [
  { id: 'categorias', label: 'Categorías', icon: LayoutGrid, empty: 'Todavía no hay cursos disponibles.' },
  { id: 'en-curso', label: 'En curso', icon: RotateCw, empty: 'No tienes cursos en progreso. Empieza uno desde Categorías.' },
  { id: 'marcadores', label: 'Marcadores', icon: Bookmark, empty: 'Aún no has marcado cursos. Usa el menú ⋮ de una tarjeta y elige “Marcar”.' },
]

interface CourseTabsProps {
  /** Lucide icons are components, so course data must stay client-side. */
  courses?: Course[]
}

export function CourseTabs({ courses = COURSES }: CourseTabsProps) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set())

  function toggleBookmark(courseId: string) {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  function coursesFor(tab: TabId) {
    if (tab === 'en-curso') return courses.filter((c) => c.progress >= 1 && c.progress <= 99)
    if (tab === 'marcadores') return courses.filter((c) => bookmarks.has(c.id))
    return courses
  }

  return (
    <Tabs defaultValue="categorias" className="gap-6">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-none bg-transparent p-0 sm:gap-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = id === 'categorias' ? null : coursesFor(id).length
          return (
            <TabsTrigger
              key={id}
              value={id}
              className="h-11 gap-2 rounded-xl border-[#1F2A3D] bg-[#101827] px-2 text-sm font-semibold text-[#94A0B8] hover:text-[#F5F3EC] data-active:border-transparent data-active:bg-[#E6C77E] data-active:text-[#0B1220] dark:text-[#94A0B8] dark:data-active:border-transparent dark:data-active:bg-[#E6C77E] dark:data-active:text-[#0B1220] sm:h-12 sm:text-base"
            >
              <Icon aria-hidden="true" />
              <span className="truncate">{label}</span>
              {count ? <span className="hidden text-xs opacity-70 sm:inline">({count})</span> : null}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {TABS.map(({ id, empty }) => {
        const list = coursesFor(id)
        return (
          <TabsContent key={id} value={id}>
            {list.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#1F2A3D] px-6 py-12 text-center text-sm leading-relaxed text-[#94A0B8]">
                {empty}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {list.map((course) => (
                  <li key={course.id}>
                    <CourseCard
                      course={course}
                      bookmarked={bookmarks.has(course.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

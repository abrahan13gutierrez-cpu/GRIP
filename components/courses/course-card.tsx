'use client'

import Link from 'next/link'
import { Bookmark, BookmarkCheck, ChevronRight, MoreVertical } from 'lucide-react'
import type { Course } from '@/data/courses'
import { ProgressBar } from '@/components/courses/progress-bar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CourseCardProps {
  course: Course
  bookmarked: boolean
  onToggleBookmark: (courseId: string) => void
}

function ctaLabel(progress: number) {
  if (progress >= 100) return 'Repasar'
  if (progress > 0) return 'Continuar'
  return 'Iniciar curso'
}

export function CourseCard({ course, bookmarked, onToggleBookmark }: CourseCardProps) {
  const { icon: Icon } = course
  const href = `/cursos/${course.id}`

  return (
    <article className="group relative flex h-full flex-col gap-6 rounded-xl border border-[#1F2A3D] bg-[#101827] p-5 transition-colors hover:border-[#E6C77E]/40 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#E6C77E]/10 text-[#E6C77E] md:size-16">
          <Icon className="size-7 md:size-8" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-6">
          <h3 className="text-pretty text-base font-semibold leading-snug text-[#F5F3EC] md:text-lg">
            {/* Stretched link: the whole card navigates to the course. */}
            <Link
              href={href}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#E6C77E]"
            >
              {course.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-[#94A0B8]">{course.description}</p>
          {bookmarked ? (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#E6C77E]">
              <BookmarkCheck className="size-3.5" aria-hidden="true" />
              Marcado
            </span>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Opciones de ${course.title}`}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-lg text-[#94A0B8] transition-colors hover:bg-[#1F2A3D] hover:text-[#F5F3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C77E]"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40 border-[#1F2A3D] bg-[#101827] text-[#F5F3EC]">
          <DropdownMenuItem onClick={() => onToggleBookmark(course.id)} className="gap-2">
            {bookmarked ? (
              <BookmarkCheck className="size-4 text-[#E6C77E]" aria-hidden="true" />
            ) : (
              <Bookmark className="size-4" aria-hidden="true" />
            )}
            {bookmarked ? 'Quitar marcador' : 'Marcar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mt-auto flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <ProgressBar value={course.progress} label={`Progreso de ${course.title}`} />
          <p className="text-sm text-[#94A0B8]">
            <span className="font-medium text-[#F5F3EC]">{course.progress} %</span> completado
          </p>
        </div>

        <Link
          href={href}
          className="relative z-10 inline-flex h-11 items-center justify-center gap-2 self-stretch rounded-lg bg-[#E6C77E] px-6 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#F0D594] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C77E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101827] sm:self-end"
        >
          {ctaLabel(course.progress)}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

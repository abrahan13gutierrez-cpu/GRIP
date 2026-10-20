import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { CourseTabs } from '@/components/courses/course-tabs'

export const metadata: Metadata = {
  title: 'Centro de aprendizaje · GRIP',
  description: 'Cursos para catchers: recepción, bloqueo, lanzamiento y lectura del juego.',
}

export default function CursosPage() {
  return (
    <div className="min-h-dvh bg-[#0B1220] text-[#F5F3EC]">
      <header className="sticky top-0 z-20 border-b border-[#1F2A3D] bg-[#0B1220]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#E6C77E]/10 text-[#E6C77E]">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <h1 className="text-lg font-semibold md:text-xl">Centro de aprendizaje</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <CourseTabs />
      </main>
    </div>
  )
}

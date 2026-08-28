"use client"

import { motion } from "framer-motion"
import { Hand, Zap, Shield, Radio, HeartHandshake, Brain, Play } from "lucide-react"
import { COURSES, type Course } from "@/lib/dashboard/data"

const ICONS: Record<string, typeof Hand> = {
  framing: Hand,
  throwing: Zap,
  blocking: Shield,
  "calling-game": Radio,
  "pitcher-relationships": HeartHandshake,
  "personal-development": Brain,
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon = ICONS[course.id] ?? Brain
  const started = course.progress > 0
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className="group flex flex-col rounded-2xl border border-[#1f2740] bg-[#111726] p-5 transition-all duration-300 hover:border-[#d4af37]/50 hover:shadow-[0_0_28px_-8px_rgba(212,175,55,0.35)]"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-inset ring-[#d4af37]/20">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-[#e8ebf2]">{course.title}</h3>
          <p className="text-xs text-[#8790a6]">{course.lessons} lessons</p>
        </div>
      </div>

      <p className="mb-5 flex-1 text-pretty text-sm leading-relaxed text-[#a3abbf]">{course.description}</p>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[#8790a6]">Progress</span>
          <span className="font-medium text-[#d4af37]">{course.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1f2740]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${course.progress}%` }}
            transition={{ delay: index * 0.06 + 0.2, duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#b8932f] to-[#e6c455]"
          />
        </div>
      </div>

      <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-[#0a0e1a] transition-colors hover:bg-[#e6c455]">
        <Play className="h-4 w-4 fill-current" />
        {started ? "Continue Course" : "Start Course"}
      </button>
    </motion.article>
  )
}

export function CoursesView() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#e8ebf2]">Courses</h1>
        <p className="mt-1 text-sm text-[#8790a6]">Train every tool behind the plate. Pick up where you left off.</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} />
        ))}
      </div>
    </div>
  )
}

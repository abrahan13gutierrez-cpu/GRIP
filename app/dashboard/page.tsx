"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { CoursesView } from "@/components/dashboard/courses-view"
import { ChatView } from "@/components/dashboard/chat-view"
import { PlaceholderView } from "@/components/dashboard/placeholder-view"
import type { ViewId } from "@/lib/dashboard/data"

export default function DashboardPage() {
  const [view, setView] = useState<ViewId>("courses")

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0a0e1a] text-[#e8ebf2]">
      <DashboardSidebar active={view} onSelect={setView} />
      <main className="min-w-0 flex-1 overflow-hidden p-3 md:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full"
          >
            {view === "courses" && (
              <div className="h-full overflow-y-auto">
                <CoursesView />
              </div>
            )}
            {view === "chat" && <ChatView />}
            {view !== "courses" && view !== "chat" && <PlaceholderView view={view} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

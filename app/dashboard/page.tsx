"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { CursosProtocol } from "@/components/dashboard/cursos-protocol"
import { MisionesLibrary } from "@/components/dashboard/misiones-library"
import { FeedbackView } from "@/components/dashboard/feedback-view"
import { ChatView } from "@/components/dashboard/chat-view"
import { PlaceholderView } from "@/components/dashboard/placeholder-view"
import type { ViewId } from "@/lib/dashboard/data"

export default function DashboardPage() {
  const [view, setView] = useState<ViewId>("courses")

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0a0e1a] text-[#e8ebf2]">
      {/* On mobile the icon bar is hidden inside the Chat view (opened via the header hamburger); it stays visible for every other view and on md+. */}
      <div className={`h-full shrink-0 ${view === "chat" ? "hidden md:block" : "block"}`}>
        <DashboardSidebar active={view} onSelect={setView} />
      </div>
      <main
        className={`min-w-0 flex-1 overflow-hidden md:p-5 ${view === "chat" ? "p-0" : "p-3"}`}
      >
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
                <CursosProtocol />
              </div>
            )}
            {view === "misiones" && (
              <div className="h-full overflow-y-auto">
                <MisionesLibrary />
              </div>
            )}
            {view === "feedback" && (
              <div className="h-full overflow-y-auto">
                <FeedbackView />
              </div>
            )}
            {view === "chat" && <ChatView activeView={view} onNavigate={setView} />}
            {view !== "courses" && view !== "misiones" && view !== "feedback" && view !== "chat" && (
              <PlaceholderView view={view} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

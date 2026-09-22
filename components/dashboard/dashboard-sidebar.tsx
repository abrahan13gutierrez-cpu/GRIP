"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Brain, User, Wallet, Crown, ListChecks, ShoppingBag, MoreHorizontal } from "lucide-react"
import type { ViewId } from "@/lib/dashboard/data"

const NAV: { id: ViewId; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Charlar", icon: MessageCircle },
  { id: "courses", label: "Cursos", icon: Brain },
  { id: "marketplace", label: "Mercado", icon: ShoppingBag },
  { id: "friends", label: "Friends", icon: User },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "rank", label: "Rank", icon: Crown },
  { id: "checklist", label: "Checklist", icon: ListChecks },
]

// Ítems dentro del popover "Más".
const MORE_ITEMS: { id: ViewId; label: string; icon: typeof MessageCircle }[] = [
  { id: "profile", label: "Perfil", icon: User },
]

export function DashboardSidebar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (id: ViewId) => void
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = MORE_ITEMS.some((i) => i.id === active)

  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-[68px] shrink-0 flex-col items-center gap-1 border-r border-[#2A3552] bg-[#0B1120] py-4"
    >
      {NAV.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            title={item.label}
            className="group relative flex w-full items-center justify-center py-1.5"
          >
            {isActive && (
              <motion.span
                layoutId="active-pill"
                className="absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-r-full bg-[#C9A227]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? "bg-[#C9A227]/10 text-[#C9A227]"
                  : "text-[#8A93A8] group-hover:bg-white/5 group-hover:text-[#F5F3EC]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
            </span>
          </button>
        )
      })}

      {/* Popover "Más" (contiene Perfil) */}
      <div className="relative mt-auto flex w-full items-center justify-center pt-1.5">
        {moreActive && (
          <motion.span
            layoutId="active-pill"
            className="absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-r-full bg-[#C9A227]"
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-label="Más"
          title="Más"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            moreOpen || moreActive
              ? "bg-[#C9A227]/10 text-[#C9A227]"
              : "text-[#8A93A8] hover:bg-white/5 hover:text-[#F5F3EC]"
          }`}
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={moreActive ? 2.4 : 2} />
        </button>

        <AnimatePresence>
          {moreOpen && (
            <>
              {/* backdrop para cerrar al hacer clic fuera */}
              <button
                aria-hidden="true"
                tabIndex={-1}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMoreOpen(false)}
              />
              <motion.div
                role="menu"
                initial={{ opacity: 0, x: -6, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-0 left-full z-50 ml-2 w-44 rounded-xl border border-[#2A3552] bg-[#131C33] p-1.5 shadow-xl shadow-black/40"
              >
                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.id
                  return (
                    <button
                      key={item.id}
                      role="menuitem"
                      onClick={() => {
                        onSelect(item.id)
                        setMoreOpen(false)
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-[#C9A227]/10 text-[#C9A227]"
                          : "text-[#c7cdd6] hover:bg-white/5 hover:text-[#F5F3EC]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  )
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

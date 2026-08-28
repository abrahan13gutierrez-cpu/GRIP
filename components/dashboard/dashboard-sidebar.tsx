"use client"

import { motion } from "framer-motion"
import { MessageCircle, Brain, User, Wallet, Crown, ListChecks, ShoppingBag } from "lucide-react"
import type { ViewId } from "@/lib/dashboard/data"

const NAV: { id: ViewId; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "courses", label: "Courses", icon: Brain },
  { id: "friends", label: "Friends", icon: User },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "rank", label: "Rank", icon: Crown },
  { id: "checklist", label: "Checklist", icon: ListChecks },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
]

export function DashboardSidebar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (id: ViewId) => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-16 shrink-0 flex-col items-stretch gap-1 border-r border-[#1f2740] bg-[#0b101f] py-4 md:w-56"
    >
      <div className="mb-4 flex items-center gap-3 px-3 md:px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d4af37] font-mono text-sm font-bold text-[#0a0e1a]">
          CU
        </div>
        <div className="hidden leading-tight md:block">
          <p className="text-sm font-semibold text-[#e8ebf2]">Catching U</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">GRIP</p>
        </div>
      </div>

      {NAV.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className="group relative flex items-center gap-3 px-3 py-2.5 md:px-4"
          >
            {isActive && (
              <motion.span
                layoutId="active-pill"
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#d4af37]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-[#8790a6] group-hover:bg-white/5 group-hover:text-[#e8ebf2]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
            </span>
            <span
              className={`hidden text-sm font-medium md:inline ${
                isActive ? "text-[#e8ebf2]" : "text-[#8790a6] group-hover:text-[#e8ebf2]"
              }`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

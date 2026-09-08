"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Brain, User, Wallet, Crown, ListChecks, ShoppingBag } from "lucide-react"
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
      className="flex h-full w-[68px] shrink-0 flex-col items-center gap-1 border-r border-[#1f2740] bg-[#0b101f] py-4"
    >
      <Link
        href="/dashboard"
        className="mb-4 flex items-center justify-center transition-opacity hover:opacity-80"
      >
        <Image
          src="/grip-emblem.png"
          alt="GRIP"
          width={44}
          height={44}
          priority
          className="h-11 w-11 shrink-0 rounded-lg object-contain"
        />
      </Link>

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
                className="absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-r-full bg-[#d4af37]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-[#8790a6] group-hover:bg-white/5 group-hover:text-[#e8ebf2]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
            </span>
          </button>
        )
      })}
    </nav>
  )
}

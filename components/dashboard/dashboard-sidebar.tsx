"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Brain, User, Wallet, Crown, ListChecks, ShoppingBag, MoreHorizontal } from "lucide-react"
import type { ViewId } from "@/lib/dashboard/data"

const NAV: { id: ViewId; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "courses", label: "Courses", icon: Brain },
]

export function DashboardSidebar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (id: ViewId) => void
}) {
  const isProfileActive = active === "profile"

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

      {/* Profile button at bottom */}
      <div className="relative mt-auto flex w-full items-center justify-center pt-1.5">
        {isProfileActive && (
          <motion.span
            layoutId="active-pill"
            className="absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-r-full bg-[#C9A227]"
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}
        <button
          onClick={() => onSelect("profile")}
          aria-current={isProfileActive ? "page" : undefined}
          aria-label="Profile"
          title="Profile"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isProfileActive
              ? "bg-[#C9A227]/10 text-[#C9A227]"
              : "text-[#8A93A8] hover:bg-white/5 hover:text-[#F5F3EC]"
          }`}
        >
          <User className="h-5 w-5" strokeWidth={isProfileActive ? 2.4 : 2} />
        </button>
      </div>
    </nav>
  )
}

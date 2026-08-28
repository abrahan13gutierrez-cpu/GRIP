"use client"

import { User, Wallet, Crown, ListChecks, ShoppingBag } from "lucide-react"
import type { ViewId } from "@/lib/dashboard/data"

const CONFIG: Record<string, { icon: typeof User; title: string; blurb: string }> = {
  friends: {
    icon: User,
    title: "Friends",
    blurb: "Connect with catchers across every campus. Follow teammates, track their reps, and build your crew.",
  },
  wallet: {
    icon: Wallet,
    title: "Wallet",
    blurb: "Your GRIP coins, streak bonuses, and rewards live here. Earn by training and showing up daily.",
  },
  rank: {
    icon: Crown,
    title: "Rank",
    blurb: "Climb from Bronze to Diamond. Your tier reflects reps logged, courses cleared, and coach reviews.",
  },
  checklist: {
    icon: ListChecks,
    title: "Checklist",
    blurb: "Your daily and weekly training tasks. Check them off to keep your streak and level up your rank.",
  },
  marketplace: {
    icon: ShoppingBag,
    title: "Marketplace",
    blurb: "Spend GRIP coins on gear, 1-on-1 coaching sessions, and exclusive film breakdowns.",
  },
}

export function PlaceholderView({ view }: { view: ViewId }) {
  const cfg = CONFIG[view]
  if (!cfg) return null
  const Icon = cfg.icon
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-inset ring-[#d4af37]/20">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#e8ebf2]">{cfg.title}</h1>
        <p className="text-pretty text-sm leading-relaxed text-[#8790a6]">{cfg.blurb}</p>
        <span className="mt-5 inline-block rounded-full border border-[#1f2740] bg-[#111726] px-3 py-1 text-xs font-medium text-[#d4af37]">
          Coming soon
        </span>
      </div>
    </div>
  )
}

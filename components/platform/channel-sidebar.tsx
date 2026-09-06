"use client"

import Link from "next/link"
import { Hash, Radio, Lock } from "lucide-react"
import type { Channel } from "@/lib/platform/types"
import { GripLogo } from "@/components/grip-logo"
import { cn } from "@/lib/utils"

export function ChannelSidebar({
  channels,
  activeSlug,
  onNavigate,
}: {
  channels: Channel[]
  activeSlug: string
  onNavigate?: () => void
}) {
  const categories = channels.reduce<Record<string, Channel[]>>((acc, ch) => {
    ;(acc[ch.category] ??= []).push(ch)
    return acc
  }, {})

  return (
    <nav className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-4 py-4">
        <GripLogo size={28} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {Object.entries(categories).map(([category, list]) => (
          <div key={category} className="mb-5">
            <p className="px-2 pb-1 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
              {category}
            </p>
            <ul className="flex flex-col gap-0.5">
              {list.map((ch) => {
                const active = ch.slug === activeSlug
                const Icon = ch.is_broadcast ? Radio : Hash
                return (
                  <li key={ch.id}>
                    <Link
                      href={`/channels/${ch.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4 shrink-0", ch.is_broadcast && "text-accent")}
                        aria-hidden="true"
                      />
                      <span className="truncate">{ch.name}</span>
                      {ch.is_broadcast && (
                        <span className="ml-auto flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                          <span className="font-mono text-[9px] tracking-wider text-accent">LIVE</span>
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/membership"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          Upgrade Membership
        </Link>
      </div>
    </nav>
  )
}

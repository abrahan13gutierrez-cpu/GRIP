"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Brain, User, Wallet, Crown, ListChecks, ShoppingBag, MoreHorizontal } from "lucide-react"
import type { ViewId } from "@/lib/dashboard/data"
import type { MessageKey } from "@/i18n/en"
import { useT } from "@/i18n"
import { useUnread } from "@/lib/status/client"

const NAV: { id: ViewId; labelKey: MessageKey; icon: typeof MessageCircle }[] = [
  { id: "chat", labelKey: "nav.chat", icon: MessageCircle },
  { id: "courses", labelKey: "nav.courses", icon: Brain },
  { id: "marketplace", labelKey: "nav.store", icon: ShoppingBag },
  { id: "friends", labelKey: "nav.friends", icon: User },
  { id: "wallet", labelKey: "nav.wallet", icon: Wallet },
  { id: "rank", labelKey: "nav.rank", icon: Crown },
  { id: "checklist", labelKey: "nav.checklist", icon: ListChecks },
]

// Ítems dentro del popover "Más".
const MORE_ITEMS: { id: ViewId; labelKey: MessageKey; icon: typeof MessageCircle }[] = [
  { id: "profile", labelKey: "nav.profile", icon: User },
]

function SectionBubble({ count, strong }: { count: number; strong?: boolean }) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      className={`absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0B1120] px-1 text-[10px] font-bold leading-none text-[#F5F3EC] ${
        strong ? "bg-[#ff3b3b]" : "bg-[#d64545]"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function DashboardSidebar({
  active,
  onSelect,
}: {
  active: ViewId
  onSelect: (id: ViewId) => void
}) {
  const t = useT()
  // Mounted on every dashboard view, so this poll is also the presence heartbeat.
  const { data: unread } = useUnread()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = MORE_ITEMS.some((i) => i.id === active)

  return (
    <nav
      aria-label={t("nav.primary")}
      className="flex h-full w-[68px] shrink-0 flex-col items-center gap-1 border-r border-[#2A3552] bg-[#0B1120] py-4"
    >
      {NAV.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        const label = t(item.labelKey)
        const count = unread?.sections?.[item.id] ?? 0
        const strong = item.id === "chat" && (unread?.mentions ?? 0) > 0
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={count > 0 ? `${label}, ${count} unread` : label}
            title={label}
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
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? "bg-[#C9A227]/10 text-[#C9A227]"
                  : "text-[#8A93A8] group-hover:bg-white/5 group-hover:text-[#F5F3EC]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              <SectionBubble count={count} strong={strong} />
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
          aria-label={t("nav.more")}
          title={t("nav.more")}
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
                      {t(item.labelKey)}
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

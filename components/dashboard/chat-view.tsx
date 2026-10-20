"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { AnimatePresence, motion } from "framer-motion"
import {
  Hash,
  Smile,
  Paperclip,
  Send,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  Users,
  Pin,
  X,
  RefreshCw,
  CornerUpLeft,
  CornerUpRight,
  CheckSquare,
  Copy,
  Link2,
  Bookmark,
  Bell,
  EyeOff,
  Flag,
  LogOut,
  User,
  Settings,
  Trash2,
  Loader2,
  Bold,
  Italic,
  Quote,
  List,
  PinOff,
  Flame,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { LiveCallModal } from "@/components/daily/live-call-modal"
import { useLiveCall } from "@/components/daily/use-live-call"
import { createClient } from "@/lib/supabase/client"
import type { ViewId } from "@/lib/dashboard/data"
import { CHAT_CATEGORIES, MOTD_CHANNEL_SLUG, QUICK_REACTIONS } from "@/lib/status/config"
import { authedFetch, awardXp, useStatus, useUnread, type StatusMember } from "@/lib/status/client"
import { useT } from "@/i18n"
import { BadgeIcons, EmojiPicker, RankBadge, RankName, RichText } from "@/components/chat/status-ui"
import { MembersPanel, usePins } from "@/components/chat/members-panel"
import { DAILY_PUZZLES, todayPuzzleIndex } from "@/lib/dashboard/daily-puzzles"
import { requestOpenPuzzle } from "@/lib/dashboard/intents"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Fila de canal proveniente de la BD.
type ChannelRow = {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  emoji: string | null
  is_broadcast: boolean
  sort_order: number
}

type ChannelGroupView = {
  label: string
  emoji: string
  channels: { id: string; name: string; emoji: string }[]
}

const CATEGORY_EMOJI: Record<string, string> = {
  INFORMATION: "📁",
  "CALL ARCHIVE": "⚡",
  LEADERBOARD: "📊",
  CHATS: "💬",
  "DAILY LESSONS": "📅",
}

type Reaction = { emoji: string; count: number; mine: boolean }

// Mensaje listo para renderizar.
type DisplayMsg = {
  id: string
  author: string
  initials: string
  avatarUrl: string | null
  time: string
  content: string
  mine: boolean
  reactions: Reaction[]
  replyAuthor: string | null
  replySnippet: string | null
  userId: string
  rankId: string
  badges: string[]
  pinned: boolean
}

type ApiMember = {
  id: string
  name: string
  role: "Coach" | "Student" | "Bot"
  avatar_url: string | null
  initials: string
  online: boolean
}

type MeProfile = {
  id: string
  email: string | null
  name: string
  username: string | null
  avatar_url: string | null
  nivel: string
  power_points: number
  role: string
}

type NotificationItem = {
  id: string
  type: string
  summary: string
  emoji: string | null
  read: boolean
  createdAt: string
  channelId: string | null
  channelName: string
  channelEmoji: string | null
  messageId: string | null
  actor: string
  actorAvatar: string | null
}

type SavedItem = {
  messageId: string
  content: string
  createdAt: string
  channelId: string | null
  channelName: string
  channelEmoji: string | null
  author: string
  avatarUrl: string | null
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  const raw = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return raw.toUpperCase()
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return `hace ${d} d`
}

function Avatar({
  url,
  initials,
  size = "md",
}: {
  url: string | null
  initials: string
  size?: "sm" | "md" | "lg"
}) {
  const dim = size === "lg" ? "h-10 w-10 text-xs" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-[10px]"
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url || "/placeholder.svg"} alt="" className={`${dim} shrink-0 rounded-full object-cover`} />
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e2942] to-[#131a2e] font-bold text-[#d4af37] ring-1 ring-inset ring-[#d4af37]/20`}
    >
      {initials}
    </div>
  )
}

/* --------------------------------- Top bar -------------------------------- */

const TOPBAR_ICON_BTN =
  "relative flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--hud-text)] transition-colors hover:bg-[color:var(--grip-tab)]"

function TopBar({
  me,
  unread,
  onToggleNotifications,
  onToggleSaved,
  onOpenSearch,
  onToggleProfileMenu,
}: {
  me: MeProfile | null
  unread: number
  onToggleNotifications: () => void
  onToggleSaved: () => void
  onOpenSearch: () => void
  onToggleProfileMenu: () => void
}) {
  const t = useT()
  return (
    <header className="flex items-center justify-between gap-2 border-b border-[color:var(--grip-line)] bg-[color:var(--grip-bg)] px-3 py-3 sm:px-4 md:px-6">
      <span className="truncate text-base font-semibold text-[color:var(--hud-text)] sm:text-lg md:text-2xl">{t("chat.title")}</span>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={onOpenSearch} aria-label={t("chat.search")} className={TOPBAR_ICON_BTN}>
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button onClick={onToggleSaved} aria-label={t("chat.saved")} className={TOPBAR_ICON_BTN}>
          <Bookmark className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button onClick={onToggleNotifications} aria-label={t("chat.notifications")} className={TOPBAR_ICON_BTN}>
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--hud-danger)] px-1 text-[10px] font-bold text-[color:var(--hud-text)]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        <span className="mx-2 hidden h-6 w-px bg-[color:var(--grip-line)] md:block" />
        <button
          onClick={onToggleProfileMenu}
          aria-label={t("chat.profileMenu")}
          className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-[color:var(--grip-tab)] md:px-2"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[color:var(--grip-gold-deep)] bg-[color:var(--grip-tab)]">
            <Avatar url={me?.avatar_url ?? null} initials={initialsFrom(me?.name ?? "GR")} size="md" />
          </span>
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-[color:var(--hud-text)] lg:block">
            {me?.username ?? me?.name ?? t("chat.myProfile")}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-[color:var(--hud-muted)] lg:block" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function ProfileMenu({
  me,
  onClose,
  onNavigate,
}: {
  me: MeProfile | null
  onClose: () => void
  onNavigate?: (id: ViewId) => void
}) {
  const t = useT()
  async function logout() {
    try {
      await createClient().auth.signOut()
    } catch {
      /* noop */
    }
    window.location.assign("/auth/login")
  }

  const items = [
    {
      label: t("chat.profile"),
      icon: User,
      onClick: () => {
        onNavigate?.("profile")
        onClose()
      },
    },
    {
      label: t("chat.accountSettings"),
      icon: Settings,
      onClick: () => {
        onNavigate?.("profile")
        onClose()
      },
    },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-2 top-12 z-50 w-60 overflow-hidden rounded-xl border border-[#1f2740] bg-[#0d1322] shadow-xl shadow-black/40">
        <div className="flex items-center gap-2.5 border-b border-[#1f2740] p-3">
          <Avatar url={me?.avatar_url ?? null} initials={initialsFrom(me?.name ?? "GR")} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#e8ebf2]">{me?.username ?? me?.name ?? t("chat.profile")}</p>
            <p className="truncate text-xs text-[#8790a6]">{me?.nivel ?? ""}</p>
          </div>
        </div>
        <div className="py-1">
          {items.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#e8ebf2] transition-colors hover:bg-white/5"
            >
              <Icon className="h-4 w-4 text-[#8790a6]" />
              {label}
            </button>
          ))}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 border-t border-[#1f2740] px-4 py-2.5 text-left text-sm text-[#ff6b6b] transition-colors hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            {t("chat.logout")}
          </button>
        </div>
      </div>
    </>
  )
}

/* ------------------------------ Notifications ----------------------------- */

function NotificationsPanel({
  onClose,
  onSelectChannel,
}: {
  onClose: () => void
  onSelectChannel: (id: string) => void
}) {
  const { data, mutate } = useSWR<{ notifications: NotificationItem[]; unread: number }>(
    "/api/chat/notifications",
    fetcher,
  )
  const notifications = data?.notifications ?? []

  async function markAll() {
    await fetch("/api/chat/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" })
    mutate()
  }

  const t = useT()
  function describe(n: NotificationItem) {
    const vars = { actor: n.actor, emoji: n.emoji ?? "" }
    if (n.type === "reaction") return t("chat.notif.reaction", vars)
    if (n.type === "reply") return t("chat.notif.reply", vars)
    if (n.type === "mention") return t("chat.notif.mention", vars)
    return n.summary || t("chat.notif.other", vars)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-2 top-12 z-50 flex max-h-[70vh] w-[min(360px,92vw)] flex-col overflow-hidden rounded-xl border border-[#1f2740] bg-[#0d1322] shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-[#1f2740] px-4 py-3">
          <span className="text-sm font-semibold text-[#e8ebf2]">{t("chat.notifications")}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={markAll}
              className="rounded-lg px-2 py-1 text-xs text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
            >
              {t("chat.markAllRead")}
            </button>
            <button
              onClick={onClose}
              aria-label={t("chat.close")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#6b7591]">{t("chat.noNotifications")}</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (n.channelId) onSelectChannel(n.channelId)
                  fetch("/api/chat/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: n.id }),
                  }).then(() => mutate())
                  onClose()
                }}
                className={`flex w-full items-start gap-3 border-b border-[#1f2740] px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                  n.read ? "" : "bg-[#d4af37]/[0.06]"
                }`}
              >
                <Avatar url={n.actorAvatar} initials={initialsFrom(n.actor)} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-[#e8ebf2]">{describe(n)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6b7591]">
                    {n.channelName && (
                      <span className="flex items-center gap-0.5">
                        <Hash className="h-3 w-3" />
                        {n.channelName}
                      </span>
                    )}
                    <span>·</span>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d4af37]" />}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

/* -------------------------------- Saved ----------------------------------- */

function SavedPanel({
  onClose,
  onSelectChannel,
}: {
  onClose: () => void
  onSelectChannel: (id: string) => void
}) {
  const t = useT()
  const { data, mutate } = useSWR<{ saved: SavedItem[] }>("/api/chat/saved", fetcher)
  const saved = data?.saved ?? []

  async function unsave(messageId: string) {
    await fetch("/api/chat/saved", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    })
    mutate()
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-2 top-12 z-50 flex max-h-[70vh] w-[min(380px,92vw)] flex-col overflow-hidden rounded-xl border border-[#1f2740] bg-[#0d1322] shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-[#1f2740] px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-[#e8ebf2]">
            <Bookmark className="h-4 w-4 text-[#d4af37]" /> {t("chat.savedMessages")}
          </span>
          <button
            onClick={onClose}
            aria-label={t("chat.close")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {saved.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#6b7591]">{t("chat.noSaved")}</p>
          ) : (
            saved.map((s) => (
              <div key={s.messageId} className="group border-b border-[#1f2740] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar url={s.avatarUrl} initials={initialsFrom(s.author)} size="sm" />
                  <span className="text-sm font-semibold text-[#e8ebf2]">{s.author}</span>
                  <button
                    onClick={() => s.channelId && onSelectChannel(s.channelId)}
                    className="ml-auto flex items-center gap-0.5 text-xs text-[#6b7591] transition-colors hover:text-[#d4af37]"
                  >
                    <Hash className="h-3 w-3" />
                    {s.channelName}
                  </button>
                  <button
                    onClick={() => unsave(s.messageId)}
                    aria-label={t("chat.removeSaved")}
                    className="flex h-6 w-6 items-center justify-center rounded text-[#6b7591] transition-colors hover:bg-white/5 hover:text-[#ff6b6b]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-[#c3cad9]">{s.content}</p>
                <p className="mt-1 text-xs text-[#6b7591]">{timeAgo(s.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

/* ---------------------------- Global search ------------------------------- */

type SearchGroup = {
  type: string
  items: { id: string; title: string; subtitle: string; emoji?: string; avatarUrl?: string }[]
}

function GlobalSearchModal({
  onClose,
  onSelectChannel,
}: {
  onClose: () => void
  onSelectChannel: (id: string) => void
}) {
  const t = useT()
  const [query, setQuery] = useState("")
  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setGroups([])
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json())
        setGroups(res.groups ?? [])
      } catch {
        setGroups([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0a0e1a]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-[#1f2740] px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-[#6b7591]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("chat.searchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#e8ebf2] outline-none placeholder:text-[#6b7591]"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[#6b7591]" />}
        <button
          onClick={onClose}
          aria-label={t("chat.closeSearch")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!query.trim() ? (
          <p className="py-10 text-center text-sm text-[#6b7591]">{t("chat.searchEmpty")}</p>
        ) : groups.length === 0 && !loading ? (
          <p className="py-10 text-center text-sm text-[#6b7591]">{t("chat.searchNoResults", { q: query })}</p>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-5">
            {groups.map((g) => (
              <div key={g.type}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7591]">{g.type}</p>
                <div className="flex flex-col gap-1">
                  {g.items.map((it) => (
                    <button
                      key={`${g.type}-${it.id}`}
                      onClick={() => {
                        if (g.type === "Canales") {
                          onSelectChannel(it.id)
                          onClose()
                        }
                      }}
                      className="flex items-center gap-3 rounded-lg border border-[#1f2740] bg-[#111726] px-3 py-2.5 text-left transition-colors hover:border-[#d4af37]/40"
                    >
                      {it.avatarUrl ? (
                        <Avatar url={it.avatarUrl} initials={initialsFrom(it.title)} size="sm" />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e2942] text-sm">
                          {it.emoji ?? (g.type === "Canales" ? "#" : g.type === "Cursos" ? "📚" : "🎯")}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#e8ebf2]">{it.title}</p>
                        <p className="truncate text-xs text-[#6b7591]">{it.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ Channel list ------------------------------ */

function ChannelList({
  groups,
  active,
  onSelect,
  unread = {},
}: {
  groups: ChannelGroupView[]
  active: string
  onSelect: (id: string) => void
  unread?: Record<string, { unread: number; mentions: number }>
}) {
  const t = useT()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggle = (label: string) => setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto border-r border-[#1f2740] bg-[#0d1322]">
      <div className="flex flex-col gap-4 p-3">
        {groups.length === 0 && <p className="px-1 text-xs text-[#6b7591]">{t("chat.loadingChannels")}</p>}
        {groups.map((group) => {
          const isCollapsed = collapsed[group.label]
          return (
            <div key={group.label}>
              <button
                onClick={() => toggle(group.label)}
                className="flex w-full items-center gap-1.5 px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7591] transition-colors hover:text-[#a3abbf]"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                )}
                {group.emoji && (
                  <span className="shrink-0 text-xs leading-none" aria-hidden="true">
                    {group.emoji}
                  </span>
                )}
                <span className="truncate text-left">{group.label}</span>
              </button>
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5">
                  {group.channels.map((ch) => {
                    const isActive = active === ch.id
                    const counts = isActive ? undefined : unread[ch.id]
                    const hasUnread = !!counts && counts.unread > 0
                    return (
                      <button
                        key={ch.id}
                        onClick={() => onSelect(ch.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-[#d4af37]/10 text-[#e8ebf2]"
                            : hasUnread
                              ? "font-semibold text-[#e8ebf2] hover:bg-white/5"
                              : "text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
                        }`}
                      >
                        {ch.emoji ? (
                          <span className="w-4 shrink-0 text-center text-sm leading-none" aria-hidden="true">
                            {ch.emoji}
                          </span>
                        ) : (
                          <Hash className="h-4 w-4 shrink-0 opacity-70" />
                        )}
                        <span className="flex-1 truncate text-left">{ch.name}</span>
                        {hasUnread &&
                          (counts.mentions > 0 ? (
                            <span
                              aria-label={t("chat.mentions", { n: counts.mentions })}
                              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--hud-danger)] px-1.5 text-[11px] font-bold text-[#e8ebf2]"
                            >
                              {counts.mentions > 99 ? "99+" : counts.mentions}
                            </span>
                          ) : (
                            <span
                              aria-label={t("chat.unread", { n: counts.unread })}
                              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37]/15 px-1.5 text-[11px] font-semibold text-[#d4af37]"
                            >
                              {counts.unread > 99 ? "99+" : counts.unread}
                            </span>
                          ))}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------- Messages --------------------------------- */

function ReactionBar({
  reactions,
  onToggle,
}: {
  reactions: Reaction[]
  onToggle: (emoji: string) => void
}) {
  if (reactions.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            r.mine
              ? "border-[#d4af37]/50 bg-[#d4af37]/15 text-[#e8ebf2]"
              : "border-[#1f2740] bg-[#111726] text-[#c3cad9] hover:border-[#d4af37]/30"
          }`}
        >
          <span>{r.emoji}</span>
          <span className="tabular-nums">{r.count}</span>
        </button>
      ))}
    </div>
  )
}

function MessageRow({
  msg,
  index,
  onOpenActions,
  onQuickReact,
  onReply,
}: {
  msg: DisplayMsg
  index: number
  onOpenActions: (msg: DisplayMsg) => void
  onQuickReact: (msg: DisplayMsg, emoji: string) => void
  onReply: (msg: DisplayMsg) => void
}) {
  const t = useT()
  const [pickerOpen, setPickerOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPress = () => {
    timer.current = setTimeout(() => onOpenActions(msg), 450)
  }
  const cancelPress = () => {
    if (timer.current) clearTimeout(timer.current)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.25, ease: "easeOut" }}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onContextMenu={(e) => {
        e.preventDefault()
        onOpenActions(msg)
      }}
      className={`group relative flex gap-3 px-4 py-2 hover:bg-white/[0.02] ${
        msg.pinned ? "bg-[#d4af37]/[0.04]" : ""
      }`}
    >
      <Avatar url={msg.avatarUrl} initials={msg.initials} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="flex min-w-0 items-center gap-1.5">
            <RankBadge rankId={msg.rankId} />
            <RankName name={msg.author} rankId={msg.rankId} className="text-sm font-semibold" />
          </span>
          <BadgeIcons ids={msg.badges} />
          {msg.mine && (
            <span className="rounded bg-[#d4af37]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#d4af37]">
              {t("chat.you")}
            </span>
          )}
          <span className="text-xs text-[#6b7591]">{msg.time}</span>
          {msg.pinned && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#d4af37]">
              <Pin className="h-3 w-3" aria-hidden="true" />
              {t("chat.pinned")}
            </span>
          )}
        </div>

        {msg.replySnippet && (
          <div className="mt-1 flex items-center gap-1.5 border-l-2 border-[#d4af37]/40 pl-2 text-xs text-[#8790a6]">
            <CornerUpLeft className="h-3 w-3 shrink-0" />
            <span className="font-medium text-[#a3abbf]">{msg.replyAuthor}</span>
            <span className="truncate">{msg.replySnippet}</span>
          </div>
        )}

        <div className="mt-1 max-w-2xl">
          <RichText content={msg.content} />
        </div>

        <ReactionBar reactions={msg.reactions} onToggle={(emoji) => onQuickReact(msg, emoji)} />
      </div>

      {/* Hover toolbar (pointer devices) */}
      <div
        className={`absolute -top-2 right-3 items-center gap-0.5 rounded-lg border border-[#1f2740] bg-[#111726] p-0.5 shadow-lg shadow-black/30 ${
          pickerOpen ? "flex" : "hidden group-hover:flex"
        }`}
      >
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onQuickReact(msg, emoji)}
            aria-label={`${t("chat.addReaction")} ${emoji}`}
            className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
        <div className="relative">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            aria-label={t("chat.addReaction")}
            aria-expanded={pickerOpen}
            className="flex h-7 w-7 items-center justify-center rounded text-[#8790a6] transition-colors hover:bg-white/10 hover:text-[#e8ebf2]"
          >
            <Smile className="h-4 w-4" />
          </button>
          {pickerOpen && (
            <EmojiPicker
              label={t("chat.addReaction")}
              className="right-0 top-9"
              onPick={(emoji) => {
                onQuickReact(msg, emoji)
                setPickerOpen(false)
              }}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
        <button
          onClick={() => onReply(msg)}
          aria-label={t("chat.reply")}
          className="flex h-7 w-7 items-center justify-center rounded text-[#8790a6] transition-colors hover:bg-white/10 hover:text-[#e8ebf2]"
        >
          <CornerUpLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onOpenActions(msg)}
          aria-label={t("chat.moreActions")}
          className="flex h-7 w-7 items-center justify-center rounded text-[#8790a6] transition-colors hover:bg-white/10 hover:text-[#e8ebf2]"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Always-visible options button for touch */}
      <button
        onClick={() => onOpenActions(msg)}
        aria-label={t("chat.messageActions")}
        className="absolute right-3 top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[#111726]/80 text-[#8790a6] ring-1 ring-[#1f2740] transition-colors hover:text-[#e8ebf2] group-hover:hidden sm:hidden"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

function MessagePane({
  channel,
  messages,
  loading,
  sending,
  replyingTo,
  onCancelReply,
  onSend,
  onOpenNav,
  onOpenMembers,
  onOpenActions,
  onQuickReact,
  onReply,
  motd,
}: {
  channel: string
  messages: DisplayMsg[]
  loading: boolean
  sending: boolean
  replyingTo: DisplayMsg | null
  onCancelReply: () => void
  onSend: (content: string) => void
  onOpenNav: () => void
  onOpenMembers: () => void
  onOpenActions: (msg: DisplayMsg) => void
  onQuickReact: (msg: DisplayMsg, emoji: string) => void
  onReply: (msg: DisplayMsg) => void
  motd?: React.ReactNode
}) {
  const t = useT()
  const [text, setText] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [text])

  const wrapSelection = (before: string, after = before) => {
    const el = inputRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const next = text.slice(0, s) + before + text.slice(s, e) + after + text.slice(e)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, e + before.length)
    })
  }

  const prefixLines = (prefix: string) => {
    const el = inputRef.current
    const s = el?.selectionStart ?? text.length
    const lineStart = text.lastIndexOf("\n", s - 1) + 1
    setText(text.slice(0, lineStart) + prefix + text.slice(lineStart))
    requestAnimationFrame(() => el?.focus())
  }

  const insertAtCursor = (value: string) => {
    const el = inputRef.current
    const s = el?.selectionStart ?? text.length
    const e = el?.selectionEnd ?? text.length
    setText(text.slice(0, s) + value + text.slice(e))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(s + value.length, s + value.length)
    })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = () => {
    const value = text.trim()
    if (!value || sending) return
    onSend(value)
    setText("")
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#0a0e1a]">
      <header className="flex items-center gap-2 border-b border-[#1f2740] px-3 py-3 sm:px-4">
        <button
          onClick={onOpenNav}
          aria-label={t("chat.openMenu")}
          className="relative -ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2] sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Hash className="h-5 w-5 shrink-0 text-[#d4af37]" />
        <span className="truncate font-semibold text-[#e8ebf2]">{channel}</span>
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            onClick={onOpenMembers}
            aria-label={t("chat.viewMembers")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <Users className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {motd}
        {loading && messages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6b7591]">{t("chat.loadingMessages")}</p>
        ) : messages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6b7591]">{t("chat.noMessages")}</p>
        ) : (
          messages.map((m, i) => (
            <MessageRow
              key={m.id}
              msg={m}
              index={i}
              onOpenActions={onOpenActions}
              onQuickReact={onQuickReact}
              onReply={onReply}
            />
          ))
        )}
      </div>

      {replyingTo && (
        <div className="flex items-center gap-2 border-t border-[#1f2740] bg-[#0d1322] px-3 py-2">
          <CornerUpLeft className="h-4 w-4 shrink-0 text-[#d4af37]" />
          <div className="min-w-0 flex-1 text-xs">
            <span className="text-[#8790a6]">{t("chat.replyingTo")} </span>
            <span className="font-medium text-[#e8ebf2]">{replyingTo.author}</span>
            <span className="ml-2 truncate text-[#6b7591]">{replyingTo.content}</span>
          </div>
          <button
            onClick={onCancelReply}
            aria-label={t("chat.cancelReply")}
            className="flex h-6 w-6 items-center justify-center rounded text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="border-t border-[#1f2740] p-3">
        <div className="rounded-xl border border-[#1f2740] bg-[#111726] focus-within:border-[#d4af37]/40">
          <div className="flex items-center gap-0.5 border-b border-[#1f2740] px-2 py-1">
            {[
              { label: t("chat.bold"), icon: Bold, run: () => wrapSelection("**") },
              { label: t("chat.italic"), icon: Italic, run: () => wrapSelection("_") },
              { label: t("chat.quote"), icon: Quote, run: () => prefixLines("> ") },
              { label: t("chat.list"), icon: List, run: () => prefixLines("- ") },
            ].map(({ label, icon: Icon, run }) => (
              <button
                key={label}
                type="button"
                onClick={run}
                aria-label={label}
                title={label}
                className="flex h-7 w-7 items-center justify-center rounded text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 px-3 py-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder={t("chat.messagePlaceholder", { channel })}
              className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed text-[#e8ebf2] outline-none placeholder:text-[#6b7591]"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setEmojiOpen((v) => !v)}
                aria-label={t("chat.emoji")}
                aria-expanded={emojiOpen}
                className="flex h-8 w-8 items-center justify-center text-[#8790a6] transition-colors hover:text-[#d4af37]"
              >
                <Smile className="h-5 w-5" />
              </button>
              {emojiOpen && (
                <EmojiPicker
                  label={t("chat.emoji")}
                  className="bottom-10 right-0"
                  onPick={insertAtCursor}
                  onClose={() => setEmojiOpen(false)}
                />
              )}
            </div>
            <button
              onClick={submit}
              disabled={sending || !text.trim()}
              aria-label={t("chat.send")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37] text-[#0a0e1a] transition-colors hover:bg-[#e6c455] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Members --------------------------------- */

/* ------------------------------- Drawers ---------------------------------- */

function LeftDrawer({
  groups,
  activeId,
  activeView,
  onSelectChannel,
  onNavigate,
  onClose,
}: {
  groups: ChannelGroupView[]
  activeId: string
  activeView?: ViewId
  onSelectChannel: (id: string) => void
  onNavigate?: (id: ViewId) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 sm:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 38 }}
        className="absolute left-0 top-0 flex h-full"
      >
        <DashboardSidebar
          active={activeView ?? "chat"}
          onSelect={(v) => {
            onNavigate?.(v)
            onClose()
          }}
        />
        <div className="w-[232px]">
          <ChannelList groups={groups} active={activeId} onSelect={onSelectChannel} />
        </div>
      </motion.div>
    </div>
  )
}

function RightDrawer({
  members,
  loading,
  channelId,
  onClose,
}: {
  members: StatusMember[]
  loading: boolean
  channelId: string | null
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 lg:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 38 }}
        className="absolute right-0 top-0 flex h-full w-[86%] max-w-[340px] flex-col border-l border-[#1f2740] bg-[#0d1322]"
      >
        <MembersPanel members={members} loading={loading} channelId={channelId} onClose={onClose} />
      </motion.div>
    </div>
  )
}

/* --------------------------- Message action sheet ------------------------- */

function MessageActionSheet({
  msg,
  onClose,
  onReact,
  onReply,
  onSave,
  onTogglePin,
}: {
  msg: DisplayMsg
  onClose: () => void
  onReact: (emoji: string) => void
  onReply: () => void
  onSave: () => void
  onTogglePin: () => void
}) {
  const t = useT()
  const actions: { label: string; icon: typeof CornerUpLeft; onClick: () => void; danger?: boolean }[] = [
    { label: t("chat.reply"), icon: CornerUpLeft, onClick: onReply },
    { label: msg.pinned ? t("chat.unpin") : t("chat.pin"), icon: msg.pinned ? PinOff : Pin, onClick: onTogglePin },
    { label: t("chat.forward"), icon: CornerUpRight, onClick: onClose },
    { label: t("chat.selectMessages"), icon: CheckSquare, onClick: onClose },
    {
      label: t("chat.copyText"),
      icon: Copy,
      onClick: () => {
        navigator.clipboard?.writeText(msg.content).catch(() => {})
        onClose()
      },
    },
    {
      label: t("chat.copyLink"),
      icon: Link2,
      onClick: () => {
        navigator.clipboard?.writeText(`${window.location.origin}/dashboard#msg-${msg.id}`).catch(() => {})
        onClose()
      },
    },
    { label: t("chat.save"), icon: Bookmark, onClick: onSave },
    { label: t("chat.notifyReplies"), icon: Bell, onClick: onClose },
    { label: t("chat.markUnread"), icon: EyeOff, onClick: onClose },
    { label: t("chat.report"), icon: Flag, onClick: onClose, danger: true },
    {
      label: t("chat.copyId"),
      icon: Hash,
      onClick: () => {
        navigator.clipboard?.writeText(msg.id).catch(() => {})
        onClose()
      },
    },
  ]

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 38 }}
        className="relative max-h-[86%] overflow-y-auto rounded-t-2xl border-t border-[#1f2740] bg-[#0d1322] pb-6"
      >
        <div className="flex items-center gap-2 border-b border-[#1f2740] px-4 py-3">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111726] text-xl transition-colors hover:bg-white/10"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="py-2">
          {actions.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex w-full items-center gap-4 px-5 py-3 text-left text-[15px] transition-colors hover:bg-white/5 ${
                danger ? "text-[#ff6b6b]" : "text-[#e8ebf2]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-current opacity-90" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* --------------------------------- Root ----------------------------------- */

export function ChatView({
  activeView,
  onNavigate,
}: {
  activeView?: ViewId
  onNavigate?: (id: ViewId) => void
}) {
  const [channelId, setChannelId] = useState<string>("")
  const [leftDrawer, setLeftDrawer] = useState(false)
  const [rightDrawer, setRightDrawer] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [actionMsg, setActionMsg] = useState<DisplayMsg | null>(null)
  const [replyingTo, setReplyingTo] = useState<DisplayMsg | null>(null)
  const [sending, setSending] = useState(false)
  const [panel, setPanel] = useState<"none" | "notifications" | "saved" | "profile">("none")
  const { roomUrl, closeCall } = useLiveCall()

  // Cliente Supabase del navegador: dentro del iframe de preview es el único que
  // conserva la sesión (las cookies no llegan a las rutas de servidor), por eso
  // los mensajes y las reacciones se leen/escriben directamente desde aquí.
  const supabase = useMemo(() => createClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [clientProfile, setClientProfile] = useState<MeProfile | null>(null)
  const [rawMessages, setRawMessages] = useState<any[]>([])
  const [msgLoading, setMsgLoading] = useState(false)

  const { data: meData } = useSWR<{ profile: MeProfile | null }>("/api/me", fetcher)
  const me = meData?.profile ?? clientProfile

  // Usuario autenticado (sesión del navegador).
  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id ?? null)
    })
    return () => {
      active = false
    }
  }, [supabase])

  // Perfil propio de respaldo si /api/me no ve la sesión en el iframe.
  useEffect(() => {
    if (!userId) return
    let active = true
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, nivel, power_points, role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) {
          setClientProfile({
            id: data.id,
            email: null,
            name: data.display_name || data.username || "GRIP",
            username: data.username ?? null,
            avatar_url: data.avatar_url ?? null,
            nivel: data.nivel ?? "",
            power_points: data.power_points ?? 0,
            role: data.role ?? "",
          })
        }
      })
    return () => {
      active = false
    }
  }, [userId, supabase])

  const t = useT()
  const { data: statusData, isLoading: statusLoading } = useStatus()
  const members = useMemo(() => statusData?.members ?? [], [statusData])
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const { data: unreadData, mutate: mutateUnread } = useUnread()

  const { data: notifData } = useSWR<{ notifications: NotificationItem[]; unread: number }>(
    "/api/chat/notifications",
    fetcher,
    { refreshInterval: 20000 },
  )
  const unread = notifData?.unread ?? 0

  const { data: channelsData } = useSWR<{ channels: ChannelRow[] }>("/api/chat/channels", fetcher)
  const allChannels = useMemo(() => channelsData?.channels ?? [], [channelsData])

  const groups = useMemo<ChannelGroupView[]>(() => {
    const bySlug = new Map(allChannels.map((c) => [c.slug, c]))
    const curated = CHAT_CATEGORIES.map(({ label, slugs }) => ({
      label,
      emoji: "",
      channels: slugs
        .map((s) => bySlug.get(s))
        .filter((c): c is ChannelRow => !!c)
        .map((c) => ({ id: c.id, name: c.name, emoji: c.emoji ?? "" })),
    })).filter((g) => g.channels.length > 0)
    if (curated.length > 0) return curated

    const map = new Map<string, { id: string; name: string; emoji: string }[]>()
    for (const c of allChannels) {
      const list = map.get(c.category) ?? []
      list.push({ id: c.id, name: c.name, emoji: c.emoji ?? "" })
      map.set(c.category, list)
    }
    return Array.from(map.entries()).map(([label, chs]) => ({
      label,
      emoji: CATEGORY_EMOJI[label] ?? "",
      channels: chs,
    }))
  }, [allChannels])

  useEffect(() => {
    const first = groups[0]?.channels[0]
    if (!channelId && first) setChannelId(first.id)
  }, [groups, channelId])

  const activeChannel = allChannels.find((c) => c.id === channelId)
  const channelName = activeChannel?.name ?? ""

  const { data: pinsData, mutate: mutatePins } = usePins(channelId || null)
  const pinnedIds = useMemo(() => new Set((pinsData?.pins ?? []).map((p) => p.id)), [pinsData])

  useEffect(() => {
    if (!channelId) return
    authedFetch("/api/status/unread", { method: "POST", body: JSON.stringify({ channelId }) })
      .then(() => mutateUnread())
      .catch(() => {})
  }, [channelId, mutateUnread])

  const puzzle = DAILY_PUZZLES[todayPuzzleIndex()]
  const puzzleDone = statusData?.me?.puzzleDoneToday ?? false
  const motd =
    activeChannel?.slug === MOTD_CHANNEL_SLUG && puzzle ? (
      <section
        aria-label={t("motd.label")}
        className="mx-3 mb-3 flex flex-col gap-3 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/[0.06] p-4 sm:flex-row sm:items-center"
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
            <Pin className="h-3 w-3" aria-hidden="true" />
            {t("motd.label")}
          </p>
          <p className="mt-1 text-pretty text-sm font-semibold text-[#e8ebf2]">
            {t("motd.title", { topic: puzzle.topic })}
          </p>
          {(statusData?.me?.streak ?? 0) > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[#a3abbf]">
              <Flame className="h-3.5 w-3.5 text-[#F59E0B]" aria-hidden="true" />
              {t("members.streak", { n: statusData?.me?.streak ?? 0 })}
            </p>
          )}
        </div>
        {puzzleDone ? (
          <span className="shrink-0 rounded-lg border border-[#4ADE80]/30 px-3 py-2 text-xs font-semibold text-[#4ADE80]">
            {t("motd.done")}
          </span>
        ) : (
          <button
            onClick={() => {
              requestOpenPuzzle()
              onNavigate?.("courses")
            }}
            className="shrink-0 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-[#0a0e1a] transition-colors hover:bg-[#e6c455]"
          >
            {t("motd.cta")}
          </button>
        )}
      </section>
    ) : null

  // Carga los mensajes del canal v��a RPC seguro (autor + reacciones agregadas,
  // sin exponer columnas sensibles de profiles).
  const loadMessages = useCallback(
    async (chId: string) => {
      const { data, error } = await supabase.rpc("get_channel_messages", { p_channel_id: chId })
      if (error) {
        console.log("[v0] loadMessages error:", error.message)
        return
      }
      setRawMessages(data ?? [])
    },
    [supabase],
  )

  // Carga inicial y al cambiar de canal.
  useEffect(() => {
    if (!channelId) {
      setRawMessages([])
      return
    }
    setMsgLoading(true)
    setRawMessages([])
    loadMessages(channelId).finally(() => setMsgLoading(false))
  }, [channelId, loadMessages])

  // Suscripción Realtime al canal activo. Se limpia al cambiar de canal o
  // desmontar para no acumular conexiones abiertas.
  useEffect(() => {
    if (!channelId) return
    const rt = supabase
      .channel(`room:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        () => loadMessages(channelId),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, () => loadMessages(channelId))
      .subscribe()
    return () => {
      supabase.removeChannel(rt)
    }
  }, [channelId, supabase, loadMessages])

  const messages: DisplayMsg[] = useMemo(
    () =>
      rawMessages.map((m: any) => ({
        id: m.id,
        author: m.author_name ?? "member",
        initials: initialsFrom(m.author_name ?? "member"),
        avatarUrl: m.author_avatar ?? null,
        time: formatTime(m.created_at),
        content: m.content,
        mine: userId ? m.user_id === userId : false,
        reactions: (m.reactions ?? []) as Reaction[],
        replyAuthor: m.reply_author ?? null,
        replySnippet: m.reply_snippet ?? null,
        userId: m.user_id,
        rankId: memberById.get(m.user_id)?.rankId ?? "",
        badges: memberById.get(m.user_id)?.badges ?? [],
        pinned: pinnedIds.has(m.id) || !!m.pinned_at,
      })),
    [rawMessages, userId, memberById, pinnedIds],
  )

  async function togglePin(msg: DisplayMsg) {
    if (msg.id.startsWith("optimistic-")) return
    try {
      await authedFetch("/api/status/pins", {
        method: "POST",
        body: JSON.stringify({ messageId: msg.id, pinned: !msg.pinned }),
      })
      await mutatePins()
    } catch (err) {
      console.log("[v0] togglePin error:", err)
    }
  }

  async function sendMessage(content: string) {
    if (!channelId || !userId) return
    setSending(true)
    const replyTo = replyingTo?.id ?? null
    const optimisticId = `optimistic-${Date.now()}`
    // Muestra el mensaje de inmediato; la recarga lo reemplaza por la fila real.
    setRawMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
        reply_to: replyTo,
        author_name: me?.name ?? me?.username ?? "member",
        author_avatar: me?.avatar_url ?? null,
        reply_author: replyingTo?.author ?? null,
        reply_snippet: replyingTo?.content ?? null,
        reactions: [],
      },
    ])
    setReplyingTo(null)
    try {
      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        user_id: userId,
        content,
        ...(replyTo ? { reply_to: replyTo } : {}),
      })
      if (error) {
        console.log("[v0] sendMessage error:", error.message)
        setRawMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        return
      }
      await loadMessages(channelId)
    } catch (err) {
      console.log("[v0] sendMessage error:", err)
      setRawMessages((prev) => prev.filter((m) => m.id !== optimisticId))
    } finally {
      setSending(false)
    }
  }

  // Alterna el contador de una reacción localmente para respuesta instantánea.
  function applyOptimisticReaction(messageId: string, emoji: string, add: boolean) {
    setRawMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const list: Reaction[] = Array.isArray(m.reactions) ? [...m.reactions] : []
        const idx = list.findIndex((r) => r.emoji === emoji)
        if (add) {
          if (idx === -1) list.push({ emoji, count: 1, mine: true })
          else list[idx] = { ...list[idx], count: list[idx].count + 1, mine: true }
        } else if (idx !== -1) {
          const count = list[idx].count - 1
          if (count <= 0) list.splice(idx, 1)
          else list[idx] = { ...list[idx], count, mine: false }
        }
        return { ...m, reactions: list }
      }),
    )
  }

  async function toggleReaction(msg: DisplayMsg, emoji: string) {
    if (!userId || msg.id.startsWith("optimistic-")) return
    const already = msg.reactions.some((r) => r.emoji === emoji && r.mine)
    applyOptimisticReaction(msg.id, emoji, !already)
    try {
      if (already) {
        await supabase
          .from("reactions")
          .delete()
          .eq("message_id", msg.id)
          .eq("user_id", userId)
          .eq("emoji", emoji)
      } else {
        await supabase.from("reactions").insert({ message_id: msg.id, user_id: userId, emoji })
      }
      if (channelId) await loadMessages(channelId)
    } catch (err) {
      console.log("[v0] toggleReaction error:", err)
      if (channelId) await loadMessages(channelId)
    }
  }

  async function saveMessage(msg: DisplayMsg) {
    try {
      await fetch("/api/chat/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msg.id }),
      })
    } catch (err) {
      console.log("[v0] saveMessage error:", err)
    }
  }

  const selectChannel = (id: string) => {
    setChannelId(id)
    setLeftDrawer(false)
    setPanel("none")
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden border-0 sm:rounded-2xl sm:border sm:border-[#1f2740]">
      <TopBar
        me={me}
        unread={unread}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleSaved={() => setPanel((p) => (p === "saved" ? "none" : "saved"))}
        onToggleNotifications={() => setPanel((p) => (p === "notifications" ? "none" : "notifications"))}
        onToggleProfileMenu={() => setPanel((p) => (p === "profile" ? "none" : "profile"))}
      />

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-56 shrink-0 sm:block">
          <ChannelList groups={groups} active={channelId} onSelect={selectChannel} unread={unreadData?.channels} />
        </div>

        <MessagePane
          motd={motd}
          channel={channelName}
          messages={messages}
          loading={msgLoading}
          sending={sending}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSend={sendMessage}
          onOpenNav={() => setLeftDrawer(true)}
          onOpenMembers={() => setRightDrawer(true)}
          onOpenActions={setActionMsg}
          onQuickReact={toggleReaction}
          onReply={(m) => setReplyingTo(m)}
        />

        <aside className="hidden h-full w-64 shrink-0 flex-col border-l border-[#1f2740] bg-[#0d1322] lg:flex">
          <MembersPanel members={members} loading={statusLoading} channelId={channelId || null} />
        </aside>
      </div>

      {/* Top-bar dropdowns */}
      {panel === "profile" && <ProfileMenu me={me} onNavigate={onNavigate} onClose={() => setPanel("none")} />}
      {panel === "notifications" && (
        <NotificationsPanel onClose={() => setPanel("none")} onSelectChannel={selectChannel} />
      )}
      {panel === "saved" && <SavedPanel onClose={() => setPanel("none")} onSelectChannel={selectChannel} />}

      {/* Overlays */}
      <AnimatePresence>
        {leftDrawer && (
          <LeftDrawer
            key="left"
            groups={groups}
            activeId={channelId}
            activeView={activeView}
            onSelectChannel={selectChannel}
            onNavigate={onNavigate}
            onClose={() => setLeftDrawer(false)}
          />
        )}
        {rightDrawer && (
          <RightDrawer
            key="right"
            members={members}
            loading={statusLoading}
            channelId={channelId || null}
            onClose={() => setRightDrawer(false)}
          />
        )}
        {actionMsg && (
          <MessageActionSheet
            key="actions"
            msg={actionMsg}
            onClose={() => setActionMsg(null)}
            onReact={(emoji) => {
              toggleReaction(actionMsg, emoji)
              setActionMsg(null)
            }}
            onReply={() => {
              setReplyingTo(actionMsg)
              setActionMsg(null)
            }}
            onSave={() => {
              saveMessage(actionMsg)
              setActionMsg(null)
            }}
            onTogglePin={() => {
              togglePin(actionMsg)
              setActionMsg(null)
            }}
          />
        )}
      </AnimatePresence>

      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} onSelectChannel={selectChannel} />}

      {roomUrl && <LiveCallModal roomUrl={roomUrl} onClose={closeCall} />}
    </div>
  )
}

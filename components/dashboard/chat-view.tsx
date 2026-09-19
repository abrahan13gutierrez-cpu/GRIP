"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { AnimatePresence, motion } from "framer-motion"
import {
  Hash,
  Smile,
  Paperclip,
  Send,
  Bot,
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
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { LiveCallModal } from "@/components/daily/live-call-modal"
import { useLiveCall } from "@/components/daily/use-live-call"
import { createClient } from "@/lib/supabase/client"
import type { ViewId } from "@/lib/dashboard/data"

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

const ROLE_LABEL: Record<ApiMember["role"], string> = {
  Coach: "Profesores",
  Student: "Estudiantes",
  Bot: "Bots",
}

const ROLE_STYLES: Record<ApiMember["role"], string> = {
  Coach: "bg-[#d4af37]/15 text-[#d4af37]",
  Bot: "bg-[#3b82f6]/15 text-[#7fb0ff]",
  Student: "bg-white/5 text-[#a3abbf]",
}

const QUICK_REACTIONS = ["👑", "💪", "🔥", "🎯", "⚡", "👍"]

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
  return (
    <header className="flex items-center gap-2 border-b border-[#1f2740] bg-[#0d1322] px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4af37]/15 text-[#d4af37]">
          <Bot className="h-4 w-4" />
        </div>
        <span className="hidden text-sm font-bold uppercase tracking-[0.14em] text-[#e8ebf2] xs:inline sm:inline">
          GRIP
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={onOpenSearch}
          aria-label="Buscar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleSaved}
          aria-label="Guardados"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
        >
          <Bookmark className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleNotifications}
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5a5a] px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        <button
          onClick={onToggleProfileMenu}
          aria-label="Menú de perfil"
          className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-white/5"
        >
          <Avatar url={me?.avatar_url ?? null} initials={initialsFrom(me?.name ?? "GR")} size="sm" />
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-[#e8ebf2] sm:inline">
            {me?.username ?? me?.name ?? "Perfil"}
          </span>
          <ChevronDown className="h-4 w-4 text-[#8790a6]" />
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
      label: "Perfil",
      icon: User,
      onClick: () => {
        onNavigate?.("profile")
        onClose()
      },
    },
    {
      label: "Configuraciones de la cuenta",
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
            <p className="truncate text-sm font-semibold text-[#e8ebf2]">{me?.username ?? me?.name ?? "Perfil"}</p>
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
            Cerrar sesión
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

  function describe(n: NotificationItem) {
    if (n.summary) return n.summary
    if (n.type === "reaction") return `${n.actor} reaccionó ${n.emoji ?? ""} a tu mensaje`
    if (n.type === "reply") return `${n.actor} respondió a tu mensaje`
    if (n.type === "mention") return `${n.actor} te mencionó`
    return `${n.actor} interactuó contigo`
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-2 top-12 z-50 flex max-h-[70vh] w-[min(360px,92vw)] flex-col overflow-hidden rounded-xl border border-[#1f2740] bg-[#0d1322] shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-[#1f2740] px-4 py-3">
          <span className="text-sm font-semibold text-[#e8ebf2]">Notificaciones</span>
          <div className="flex items-center gap-1">
            <button
              onClick={markAll}
              className="rounded-lg px-2 py-1 text-xs text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
            >
              Marcar leídas
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#6b7591]">No tienes notificaciones.</p>
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
            <Bookmark className="h-4 w-4 text-[#d4af37]" /> Mensajes guardados
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {saved.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#6b7591]">
              Aún no has guardado mensajes. Usa &quot;Guardar mensaje&quot; en las acciones.
            </p>
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
                    aria-label="Quitar de guardados"
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
          placeholder="Buscar cursos, misiones, canales y personas…"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#e8ebf2] outline-none placeholder:text-[#6b7591]"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[#6b7591]" />}
        <button
          onClick={onClose}
          aria-label="Cerrar búsqueda"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!query.trim() ? (
          <p className="py-10 text-center text-sm text-[#6b7591]">Escribe para buscar en todo el campus.</p>
        ) : groups.length === 0 && !loading ? (
          <p className="py-10 text-center text-sm text-[#6b7591]">Sin resultados para &quot;{query}&quot;.</p>
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
}: {
  groups: ChannelGroupView[]
  active: string
  onSelect: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggle = (label: string) => setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto border-r border-[#1f2740] bg-[#0d1322]">
      <div className="flex flex-col gap-4 p-3">
        {groups.length === 0 && <p className="px-1 text-xs text-[#6b7591]">Cargando canales…</p>}
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
                    return (
                      <button
                        key={ch.id}
                        onClick={() => onSelect(ch.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-[#d4af37]/10 text-[#e8ebf2]"
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
      className="group relative flex gap-3 px-4 py-2 hover:bg-white/[0.02]"
    >
      <Avatar url={msg.avatarUrl} initials={msg.initials} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#e8ebf2]">{msg.author}</span>
          {msg.mine && (
            <span className="rounded bg-[#d4af37]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#d4af37]">Tú</span>
          )}
          <span className="text-xs text-[#6b7591]">{msg.time}</span>
        </div>

        {msg.replySnippet && (
          <div className="mt-1 flex items-center gap-1.5 border-l-2 border-[#d4af37]/40 pl-2 text-xs text-[#8790a6]">
            <CornerUpLeft className="h-3 w-3 shrink-0" />
            <span className="font-medium text-[#a3abbf]">{msg.replyAuthor}</span>
            <span className="truncate">{msg.replySnippet}</span>
          </div>
        )}

        <div className="mt-1 max-w-lg">
          <p className="text-pretty text-sm leading-relaxed text-[#c3cad9]">{msg.content}</p>
        </div>

        <ReactionBar reactions={msg.reactions} onToggle={(emoji) => onQuickReact(msg, emoji)} />
      </div>

      {/* Hover toolbar (pointer devices) */}
      <div className="absolute -top-2 right-3 hidden items-center gap-0.5 rounded-lg border border-[#1f2740] bg-[#111726] p-0.5 shadow-lg shadow-black/30 group-hover:flex">
        {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
          <button
            key={emoji}
            onClick={() => onQuickReact(msg, emoji)}
            className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={() => onReply(msg)}
          aria-label="Responder"
          className="flex h-7 w-7 items-center justify-center rounded text-[#8790a6] transition-colors hover:bg-white/10 hover:text-[#e8ebf2]"
        >
          <CornerUpLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onOpenActions(msg)}
          aria-label="Más acciones"
          className="flex h-7 w-7 items-center justify-center rounded text-[#8790a6] transition-colors hover:bg-white/10 hover:text-[#e8ebf2]"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Always-visible options button for touch */}
      <button
        onClick={() => onOpenActions(msg)}
        aria-label="Acciones del mensaje"
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
}) {
  const [text, setText] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)

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
          aria-label="Abrir menú"
          className="relative -ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2] sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Hash className="h-5 w-5 shrink-0 text-[#d4af37]" />
        <span className="truncate font-semibold text-[#e8ebf2]">{channel}</span>
        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <button
            onClick={onOpenMembers}
            aria-label="Ver miembros"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <Users className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {loading && messages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6b7591]">Cargando mensajes…</p>
        ) : messages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6b7591]">Aún no hay mensajes. Sé el primero en escribir.</p>
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
            <span className="text-[#8790a6]">En respuesta a </span>
            <span className="font-medium text-[#e8ebf2]">{replyingTo.author}</span>
            <span className="ml-2 truncate text-[#6b7591]">{replyingTo.content}</span>
          </div>
          <button
            onClick={onCancelReply}
            aria-label="Cancelar respuesta"
            className="flex h-6 w-6 items-center justify-center rounded text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="border-t border-[#1f2740] p-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#1f2740] bg-[#111726] px-3 py-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={`Mensaje para #${channel}`}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#e8ebf2] outline-none placeholder:text-[#6b7591]"
          />
          <button aria-label="Emoji" className="text-[#8790a6] transition-colors hover:text-[#d4af37]">
            <Smile className="h-5 w-5" />
          </button>
          <button aria-label="Adjuntar" className="text-[#8790a6] transition-colors hover:text-[#d4af37]">
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            onClick={submit}
            disabled={sending || !text.trim()}
            aria-label="Enviar mensaje"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37] text-[#0a0e1a] transition-colors hover:bg-[#e6c455] disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Members --------------------------------- */

function MemberRow({ member }: { member: ApiMember }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5">
      <div className="relative">
        <Avatar url={member.avatar_url} initials={member.initials} size="md" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d1322] ${
            member.online ? "bg-[#4ade80]" : "bg-[#4b5468]"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${member.online ? "text-[#e8ebf2]" : "text-[#8790a6]"}`}>{member.name}</p>
      </div>
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ROLE_STYLES[member.role]}`}>{member.role}</span>
    </div>
  )
}

function groupMembers(members: ApiMember[]) {
  const order: ApiMember["role"][] = ["Coach", "Student", "Bot"]
  return order
    .map((role) => ({ role, members: members.filter((m) => m.role === role) }))
    .filter((g) => g.members.length > 0)
}

function MemberList({ members }: { members: ApiMember[] }) {
  const groups = groupMembers(members)
  return (
    <div className="hidden h-full w-56 shrink-0 flex-col gap-4 overflow-y-auto border-l border-[#1f2740] bg-[#0d1322] p-3 lg:flex">
      {groups.length === 0 && <p className="px-2 text-xs text-[#6b7591]">Cargando miembros…</p>}
      {groups.map((g) => (
        <div key={g.role}>
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7591]">
            {ROLE_LABEL[g.role]} — {g.members.length}
          </p>
          <div className="flex flex-col gap-0.5">
            {g.members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MembersByRole({ members }: { members: ApiMember[] }) {
  const groups = groupMembers(members)
  return (
    <div className="flex flex-col gap-4 p-3">
      {groups.length === 0 && <p className="px-2 text-xs text-[#6b7591]">Cargando miembros…</p>}
      {groups.map((g) => (
        <div key={g.role}>
          <p className="px-2 pb-1 text-[11px] font-semibold text-[#8790a6]">
            {ROLE_LABEL[g.role]} — {g.members.length}
          </p>
          <div className="flex flex-col gap-0.5">
            {g.members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

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
  channel,
  members,
  onClose,
}: {
  channel: string
  members: ApiMember[]
  onClose: () => void
}) {
  const [tab, setTab] = useState<"members" | "pinned">("members")
  const onlineCount = members.filter((m) => m.online).length

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
        <div className="flex items-center gap-2.5 border-b border-[#1f2740] px-4 py-3">
          <button
            onClick={onClose}
            aria-label="Cerrar miembros"
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e2942] text-[#d4af37]">
            <Hash className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#e8ebf2]">{channel}</p>
            <p className="flex items-center gap-1.5 text-xs text-[#8790a6]">
              <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
              {onlineCount} en línea
            </p>
          </div>
          <button aria-label="Refrescar" className="text-[#6b7591] hover:text-[#e8ebf2]">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-[#1f2740]">
          <button
            onClick={() => setTab("members")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
              tab === "members" ? "border-b-2 border-[#d4af37] text-[#e8ebf2]" : "text-[#6b7591] hover:text-[#a3abbf]"
            }`}
          >
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTab("pinned")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
              tab === "pinned" ? "border-b-2 border-[#d4af37] text-[#e8ebf2]" : "text-[#6b7591] hover:text-[#a3abbf]"
            }`}
          >
            <Pin className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "members" ? (
            <MembersByRole members={members} />
          ) : (
            <div className="p-4">
              <div className="flex items-start gap-2 rounded-xl border border-[#1f2740] bg-[#111726] p-3">
                <Pin className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#d4af37]">Mensaje fijado</p>
                  <p className="mt-1 text-sm text-[#c3cad9]">
                    Bienvenido a GRIP. Publica tus victorias diarias y etiqueta a un profesor para recibir feedback.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
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
}: {
  msg: DisplayMsg
  onClose: () => void
  onReact: (emoji: string) => void
  onReply: () => void
  onSave: () => void
}) {
  const actions: { label: string; icon: typeof CornerUpLeft; onClick: () => void; danger?: boolean }[] = [
    { label: "Responder", icon: CornerUpLeft, onClick: onReply },
    { label: "Reenviar", icon: CornerUpRight, onClick: onClose },
    { label: "Seleccionar mensajes", icon: CheckSquare, onClick: onClose },
    {
      label: "Copiar texto del mensaje",
      icon: Copy,
      onClick: () => {
        navigator.clipboard?.writeText(msg.content).catch(() => {})
        onClose()
      },
    },
    {
      label: "Copiar enlace del mensaje",
      icon: Link2,
      onClick: () => {
        navigator.clipboard?.writeText(`${window.location.origin}/dashboard#msg-${msg.id}`).catch(() => {})
        onClose()
      },
    },
    { label: "Guardar mensaje", icon: Bookmark, onClick: onSave },
    { label: "Notificar respuestas", icon: Bell, onClick: onClose },
    { label: "Marcar como no leído", icon: EyeOff, onClick: onClose },
    { label: "Reportar mensaje", icon: Flag, onClick: onClose, danger: true },
    {
      label: "Copiar ID del mensaje",
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

  const { data: membersData } = useSWR<{ members: ApiMember[] }>("/api/chat/members", fetcher, {
    refreshInterval: 30000,
  })
  const members = useMemo(() => membersData?.members ?? [], [membersData])

  const { data: notifData } = useSWR<{ notifications: NotificationItem[]; unread: number }>(
    "/api/chat/notifications",
    fetcher,
    { refreshInterval: 20000 },
  )
  const unread = notifData?.unread ?? 0

  const { data: channelsData } = useSWR<{ channels: ChannelRow[] }>("/api/chat/channels", fetcher)
  const channels = useMemo(() => channelsData?.channels ?? [], [channelsData])

  useEffect(() => {
    if (!channelId && channels.length > 0) setChannelId(channels[0].id)
  }, [channels, channelId])

  const activeChannel = channels.find((c) => c.id === channelId)
  const channelName = activeChannel?.name ?? ""

  const groups = useMemo<ChannelGroupView[]>(() => {
    const map = new Map<string, { id: string; name: string; emoji: string }[]>()
    for (const c of channels) {
      const list = map.get(c.category) ?? []
      list.push({ id: c.id, name: c.name, emoji: c.emoji ?? "" })
      map.set(c.category, list)
    }
    return Array.from(map.entries()).map(([label, chs]) => ({
      label,
      emoji: CATEGORY_EMOJI[label] ?? "",
      channels: chs,
    }))
  }, [channels])

  // Carga los mensajes del canal vía RPC seguro (autor + reacciones agregadas,
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
      })),
    [rawMessages, userId],
  )

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
          <ChannelList groups={groups} active={channelId} onSelect={selectChannel} />
        </div>

        <MessagePane
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

        <MemberList members={members} />
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
          <RightDrawer key="right" channel={channelName} members={members} onClose={() => setRightDrawer(false)} />
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
          />
        )}
      </AnimatePresence>

      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} onSelectChannel={selectChannel} />}

      {roomUrl && <LiveCallModal roomUrl={roomUrl} onClose={closeCall} />}
    </div>
  )
}

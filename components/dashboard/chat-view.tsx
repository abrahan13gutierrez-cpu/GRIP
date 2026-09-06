"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  SlidersHorizontal,
  CornerUpLeft,
  CornerUpRight,
  CheckSquare,
  Copy,
  Link2,
  Bookmark,
  Bell,
  EyeOff,
  Flag,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { LiveCallModal } from "@/components/daily/live-call-modal"
import { useLiveCall } from "@/components/daily/use-live-call"
import { MEMBERS, type Member, type ViewId } from "@/lib/dashboard/data"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Fila de canal proveniente de la BD.
type ChannelRow = {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  is_broadcast: boolean
  sort_order: number
}

// Grupo de canales por categoría, para la barra lateral.
type ChannelGroupView = { label: string; channels: { id: string; name: string }[] }

// Mensaje real ya listo para renderizar.
type DisplayMsg = {
  id: string
  author: string
  initials: string
  time: string
  content: string
  mine: boolean
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

const ROLE_STYLES: Record<string, string> = {
  Coach: "bg-[#d4af37]/15 text-[#d4af37]",
  Bot: "bg-[#3b82f6]/15 text-[#7fb0ff]",
  Student: "bg-white/5 text-[#a3abbf]",
}

const QUICK_REACTIONS = ["👑", "💪", "🔥", "🎯"]

const MESSAGE_ACTIONS: { label: string; icon: typeof CornerUpLeft }[] = [
  { label: "View Replies", icon: CornerUpLeft },
  { label: "Forward", icon: CornerUpRight },
  { label: "Select messages", icon: CheckSquare },
  { label: "Copy message text", icon: Copy },
  { label: "Copy message link", icon: Link2 },
  { label: "Save Message", icon: Bookmark },
  { label: "Notify on Replies", icon: Bell },
  { label: "Mark as Unread", icon: EyeOff },
  { label: "Report message", icon: Flag },
  { label: "Copy Message ID", icon: Hash },
]

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
      <div className="flex items-center gap-2.5 border-b border-[#1f2740] px-3 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/15 text-[#d4af37]">
          <Bot className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold uppercase tracking-[0.14em] text-[#e8ebf2]">GRIP</span>
      </div>

      <div className="flex flex-col gap-4 p-3">
        {groups.length === 0 && (
          <p className="px-1 text-xs text-[#6b7591]">Cargando canales…</p>
        )}
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
                        <Hash className="h-4 w-4 shrink-0 opacity-70" />
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

function MessageRow({
  msg,
  index,
  onOpenActions,
}: {
  msg: DisplayMsg
  index: number
  onOpenActions: (msg: DisplayMsg) => void
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e2942] to-[#131a2e] text-xs font-bold text-[#d4af37] ring-1 ring-inset ring-[#d4af37]/20">
        {msg.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#e8ebf2]">{msg.author}</span>
          {msg.mine && (
            <span className="rounded bg-[#d4af37]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#d4af37]">Tú</span>
          )}
          <span className="text-xs text-[#6b7591]">{msg.time}</span>
        </div>
        <div className="mt-1 max-w-lg">
          <p className="text-pretty text-sm leading-relaxed text-[#c3cad9]">{msg.content}</p>
        </div>
      </div>

      {/* Options button (mouse/desktop affordance) */}
      <button
        onClick={() => onOpenActions(msg)}
        aria-label="Message actions"
        className="absolute right-3 top-1 hidden h-7 w-7 items-center justify-center rounded-lg bg-[#111726] text-[#8790a6] ring-1 ring-[#1f2740] transition-colors hover:text-[#e8ebf2] group-hover:flex"
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
  onSend,
  onOpenNav,
  onOpenSearch,
  onOpenMembers,
  onOpenActions,
}: {
  channel: string
  messages: DisplayMsg[]
  loading: boolean
  sending: boolean
  onSend: (content: string) => void
  onOpenNav: () => void
  onOpenSearch: () => void
  onOpenMembers: () => void
  onOpenActions: (msg: DisplayMsg) => void
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
          aria-label="Open menu"
          className="relative -ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2] sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Hash className="h-5 w-5 shrink-0 text-[#d4af37]" />
        <span className="truncate font-semibold text-[#e8ebf2]">{channel}</span>
        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <button
            onClick={onOpenSearch}
            aria-label="Search messages"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] transition-colors hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={onOpenMembers}
            aria-label="Show members"
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
          <p className="px-4 py-8 text-center text-sm text-[#6b7591]">
            Aún no hay mensajes. Sé el primero en escribir.
          </p>
        ) : (
          messages.map((m, i) => <MessageRow key={m.id} msg={m} index={i} onOpenActions={onOpenActions} />)
        )}
      </div>

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
            placeholder={`Message #${channel}`}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#e8ebf2] outline-none placeholder:text-[#6b7591]"
          />
          <button aria-label="Add emoji" className="text-[#8790a6] transition-colors hover:text-[#d4af37]">
            <Smile className="h-5 w-5" />
          </button>
          <button aria-label="Attach file" className="text-[#8790a6] transition-colors hover:text-[#d4af37]">
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            onClick={submit}
            disabled={sending || !text.trim()}
            aria-label="Send message"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37] text-[#0a0e1a] transition-colors hover:bg-[#e6c455] disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5">
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2942] text-[10px] font-bold text-[#d4af37]">
          {member.initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d1322] ${
            member.online ? "bg-[#4ade80]" : "bg-[#4b5468]"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${member.online ? "text-[#e8ebf2]" : "text-[#8790a6]"}`}>{member.name}</p>
        <p className="text-[10px] uppercase tracking-wide text-[#6b7591]">{member.rank}</p>
      </div>
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ROLE_STYLES[member.role]}`}>{member.role}</span>
    </div>
  )
}

/** Desktop/tablet member column (lg+). Unchanged behavior: grouped by online/offline. */
function MemberList() {
  const online = MEMBERS.filter((m) => m.online)
  const offline = MEMBERS.filter((m) => !m.online)
  return (
    <div className="hidden h-full w-56 shrink-0 flex-col gap-4 overflow-y-auto border-l border-[#1f2740] bg-[#0d1322] p-3 lg:flex">
      <div>
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7591]">
          Online — {online.length}
        </p>
        <div className="flex flex-col gap-0.5">
          {online.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      </div>
      <div>
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7591]">
          Offline — {offline.length}
        </p>
        <div className="flex flex-col gap-0.5">
          {offline.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Members grouped by role, used inside the mobile right drawer. */
function MembersByRole() {
  const order: Member["role"][] = ["Coach", "Student", "Bot"]
  const groups = order
    .map((role) => ({ role, members: MEMBERS.filter((m) => m.role === role) }))
    .filter((g) => g.members.length > 0)

  return (
    <div className="flex flex-col gap-4 p-3">
      {groups.map((g) => (
        <div key={g.role}>
          <p className="px-2 pb-1 text-[11px] font-semibold text-[#8790a6]">
            {g.role} — {g.members.length}
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

/** Left slide-in drawer: icon nav + channel list (mobile only). */
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

/** Right slide-in drawer: members + pinned tabs (mobile only). */
function RightDrawer({ channel, onClose }: { channel: string; onClose: () => void }) {
  const [tab, setTab] = useState<"members" | "pinned">("members")
  const onlineCount = MEMBERS.filter((m) => m.online).length

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
            aria-label="Close members"
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
              {onlineCount} online
            </p>
          </div>
          <button aria-label="Refresh" className="text-[#6b7591] hover:text-[#e8ebf2]">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-[#1f2740]">
          <button
            onClick={() => setTab("members")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
              tab === "members"
                ? "border-b-2 border-[#d4af37] text-[#e8ebf2]"
                : "text-[#6b7591] hover:text-[#a3abbf]"
            }`}
          >
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTab("pinned")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
              tab === "pinned"
                ? "border-b-2 border-[#d4af37] text-[#e8ebf2]"
                : "text-[#6b7591] hover:text-[#a3abbf]"
            }`}
          >
            <Pin className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "members" ? (
            <MembersByRole />
          ) : (
            <div className="p-4">
              <div className="flex items-start gap-2 rounded-xl border border-[#1f2740] bg-[#111726] p-3">
                <Pin className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#d4af37]">Pinned message</p>
                  <p className="mt-1 text-sm text-[#c3cad9]">
                    Welcome to GRIP. Post your daily wins and tag a coach for feedback.
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

/** Message search modal (mobile). */
function SearchModal({
  channel,
  messages,
  onClose,
}: {
  channel: string
  messages: DisplayMsg[]
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return messages
    return messages.filter((m) => m.content.toLowerCase().includes(q) || m.author.toLowerCase().includes(q))
  }, [query, messages])

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0a0e1a] sm:hidden">
      <div className="flex items-center justify-between border-b border-[#1f2740] px-4 py-3">
        <span className="text-lg font-semibold text-[#e8ebf2]">Searching messages</span>
        <button
          onClick={onClose}
          aria-label="Close search"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-[#1f2740] p-4">
        <div className="rounded-xl border border-[#1f2740] bg-[#111726] p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e2942] px-2 py-1 text-xs text-[#c3cad9]">
            <Hash className="h-3 w-3" /> {channel}
            <button onClick={() => setQuery("")} aria-label="Clear channel filter">
              <X className="h-3 w-3 text-[#8790a6]" />
            </button>
          </span>
          <div className="mt-2 flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-[#6b7591]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Continue searching..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#e8ebf2] outline-none placeholder:text-[#6b7591]"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setQuery("")}
            className="rounded-lg border border-[#1f2740] px-3 py-1.5 text-xs text-[#c3cad9] hover:bg-white/5"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#1f2740] px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b7591]">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </span>
        <button className="shrink-0 rounded-full border border-[#1f2740] bg-[#111726] px-3 py-1.5 text-xs text-[#c3cad9]">
          Sort: Newest
        </button>
        <button className="shrink-0 rounded-full border border-[#1f2740] bg-[#111726] px-3 py-1.5 text-xs text-[#c3cad9]">
          From: Any user
        </button>
        <button className="shrink-0 rounded-full border border-[#1f2740] bg-[#111726] px-3 py-1.5 text-xs text-[#c3cad9]">
          In: #{channel}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6b7591]">No messages found.</p>
        ) : (
          results.map((m) => {
            const isLong = m.content.length > 90
            const isExpanded = expanded[m.id]
            return (
              <div key={m.id} className="border-b border-[#1f2740] p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e2942] text-[10px] font-bold text-[#d4af37]">
                    {m.initials}
                  </div>
                  <span className="text-sm font-semibold text-[#e8ebf2]">{m.author}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-[#6b7591]">
                    <Hash className="h-3 w-3" /> {channel}
                  </span>
                </div>
                <p className={`mt-2 text-sm leading-relaxed text-[#c3cad9] ${isLong && !isExpanded ? "line-clamp-2" : ""}`}>
                  {m.content}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#6b7591]">{m.time}</span>
                  {isLong && (
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [m.id]: !p[m.id] }))}
                      className="rounded-lg border border-[#1f2740] px-2 py-1 text-xs text-[#c3cad9] hover:bg-white/5"
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/** Long-press / options action sheet with quick reactions. */
function MessageActionSheet({ msg, onClose }: { msg: DisplayMsg; onClose: () => void }) {
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
        {/* Quick reactions row */}
        <div className="flex items-center gap-2 border-b border-[#1f2740] px-4 py-3">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111726] text-xl transition-colors hover:bg-white/10"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={onClose}
            aria-label="More reactions"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#111726] text-[#8790a6] transition-colors hover:bg-white/10"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="py-2">
          {MESSAGE_ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                if (label === "Copy message text") {
                  navigator.clipboard?.writeText(msg.content).catch(() => {})
                } else if (label === "Copy Message ID") {
                  navigator.clipboard?.writeText(msg.id).catch(() => {})
                }
                onClose()
              }}
              className={`flex w-full items-center gap-4 px-5 py-3 text-left text-[15px] transition-colors hover:bg-white/5 ${
                label === "Report message" ? "text-[#ff6b6b]" : "text-[#e8ebf2]"
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
  const [sending, setSending] = useState(false)
  const { roomUrl, closeCall } = useLiveCall()

  const { data: channelsData } = useSWR<{ channels: ChannelRow[] }>("/api/chat/channels", fetcher)
  const channels = useMemo(() => channelsData?.channels ?? [], [channelsData])

  // Selecciona el primer canal automáticamente una vez cargados.
  useEffect(() => {
    if (!channelId && channels.length > 0) setChannelId(channels[0].id)
  }, [channels, channelId])

  const activeChannel = channels.find((c) => c.id === channelId)
  const channelName = activeChannel?.name ?? ""

  // Agrupa canales reales por categoría para la barra lateral.
  const groups = useMemo<ChannelGroupView[]>(() => {
    const map = new Map<string, { id: string; name: string }[]>()
    for (const c of channels) {
      const list = map.get(c.category) ?? []
      list.push({ id: c.id, name: c.name })
      map.set(c.category, list)
    }
    return Array.from(map.entries()).map(([label, chs]) => ({ label, channels: chs }))
  }, [channels])

  // Mensajes reales del canal activo, con refresco periódico ligero.
  const { data: msgData, isLoading, mutate: mutateMessages } = useSWR<{
    messages: (DisplayMsg & { created_at: string })[]
  }>(channelId ? `/api/chat/messages?channelId=${channelId}` : null, fetcher, {
    refreshInterval: 5000,
  })

  const messages: DisplayMsg[] = useMemo(
    () =>
      (msgData?.messages ?? []).map((m: any) => ({
        id: m.id,
        author: m.username ?? m.author ?? "member",
        initials: initialsFrom(m.username ?? m.author ?? "member"),
        time: formatTime(m.created_at),
        content: m.content,
        mine: Boolean(m.mine),
      })),
    [msgData],
  )

  async function sendMessage(content: string) {
    if (!channelId) return
    setSending(true)
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, content }),
      })
      await mutateMessages()
    } catch (err) {
      console.log("[v0] sendMessage error:", err)
    } finally {
      setSending(false)
    }
  }

  const selectChannel = (id: string) => {
    setChannelId(id)
    setLeftDrawer(false)
  }

  return (
    <div className="relative flex h-full overflow-hidden border-0 sm:rounded-2xl sm:border sm:border-[#1f2740]">
      {/* Channel list — tablet/desktop only */}
      <div className="hidden w-56 shrink-0 sm:block">
        <ChannelList groups={groups} active={channelId} onSelect={selectChannel} />
      </div>

      {/* Message pane — always full-screen on mobile */}
      <MessagePane
        channel={channelName}
        messages={messages}
        loading={isLoading}
        sending={sending}
        onSend={sendMessage}
        onOpenNav={() => setLeftDrawer(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMembers={() => setRightDrawer(true)}
        onOpenActions={setActionMsg}
      />

      {/* Member column — lg+ only */}
      <MemberList />

      {/* Mobile overlays */}
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
        {rightDrawer && <RightDrawer key="right" channel={channelName} onClose={() => setRightDrawer(false)} />}
        {searchOpen && (
          <SearchModal key="search" channel={channelName} messages={messages} onClose={() => setSearchOpen(false)} />
        )}
        {actionMsg && <MessageActionSheet key="actions" msg={actionMsg} onClose={() => setActionMsg(null)} />}
      </AnimatePresence>

      {roomUrl && <LiveCallModal roomUrl={roomUrl} onClose={closeCall} />}
    </div>
  )
}

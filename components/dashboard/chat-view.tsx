"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Hash, Play, Mic, Smile, Paperclip, Send, Bot, ChevronDown, ChevronRight } from "lucide-react"
import {
  CHANNEL_GROUPS,
  MESSAGES,
  MEMBERS,
  type Message,
  type Member,
} from "@/lib/dashboard/data"

const ROLE_STYLES: Record<string, string> = {
  Coach: "bg-[#d4af37]/15 text-[#d4af37]",
  Bot: "bg-[#3b82f6]/15 text-[#7fb0ff]",
  Student: "bg-white/5 text-[#a3abbf]",
}

function ChannelList({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
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
        {CHANNEL_GROUPS.map((group) => {
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
                <span className="shrink-0">{group.emoji}</span>
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
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-[#d4af37]/10 text-[#e8ebf2]"
                            : "text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
                        }`}
                      >
                        <span className="shrink-0 text-[15px] leading-none">{ch.emoji}</span>
                        <span className="flex-1 truncate text-left">{ch.name}</span>
                        {ch.live && (
                          <span className="flex items-center gap-1 rounded-full bg-[#ef4444]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#ff6b6b]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b6b]" />
                            Live
                          </span>
                        )}
                        {ch.unread ? (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[10px] font-bold text-[#0a0e1a]">
                            {ch.unread}
                          </span>
                        ) : null}
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

function VoiceBubble({ duration }: { duration: string }) {
  const bars = [8, 14, 20, 11, 24, 16, 9, 18, 13, 22, 10, 15, 19, 7, 12]
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1f2740] bg-[#0d1322] px-3 py-2.5">
      <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0a0e1a]">
        <Play className="h-4 w-4 fill-current" />
      </button>
      <div className="flex h-8 items-center gap-0.5">
        {bars.map((h, i) => (
          <span key={i} className="w-0.5 rounded-full bg-[#d4af37]/50" style={{ height: `${h}px` }} />
        ))}
      </div>
      <span className="text-xs tabular-nums text-[#8790a6]">{duration}</span>
    </div>
  )
}

function MessageRow({ msg, index }: { msg: Message; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="flex gap-3 px-4 py-2 hover:bg-white/[0.02]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e2942] to-[#131a2e] text-xs font-bold text-[#d4af37] ring-1 ring-inset ring-[#d4af37]/20">
        {msg.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#e8ebf2]">{msg.author}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ROLE_STYLES[msg.role]}`}>{msg.role}</span>
          <span className="text-[10px] uppercase tracking-wide text-[#6b7591]">{msg.rank}</span>
          <span className="text-xs text-[#6b7591]">{msg.time}</span>
        </div>
        <div className="mt-1 max-w-lg">
          {msg.type === "voice" ? (
            <VoiceBubble duration={msg.duration ?? "0:00"} />
          ) : (
            <p className="text-pretty text-sm leading-relaxed text-[#c3cad9]">{msg.content}</p>
          )}
        </div>
        {msg.reactions && msg.reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.reactions.map((r) => (
              <button
                key={r.emoji}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                  r.reacted
                    ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#d4af37]"
                    : "border-[#1f2740] bg-[#0d1322] text-[#a3abbf] hover:border-[#2a3a5c]"
                }`}
              >
                <span>{r.emoji}</span>
                <span className="tabular-nums">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MessagePane({ channel }: { channel: string }) {
  const [text, setText] = useState("")
  const days = ["Yesterday", "Today"] as const

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#0a0e1a]">
      <header className="flex items-center gap-2 border-b border-[#1f2740] px-4 py-3">
        <Hash className="h-5 w-5 text-[#d4af37]" />
        <span className="font-semibold text-[#e8ebf2]">{channel}</span>
      </header>

      <div className="flex-1 overflow-y-auto py-3">
        {days.map((day) => {
          const dayMsgs = MESSAGES.filter((m) => m.day === day)
          if (dayMsgs.length === 0) return null
          return (
            <div key={day}>
              <div className="my-2 flex items-center gap-3 px-4">
                <div className="h-px flex-1 bg-[#1f2740]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7591]">{day}</span>
                <div className="h-px flex-1 bg-[#1f2740]" />
              </div>
              {dayMsgs.map((m, i) => (
                <MessageRow key={m.id} msg={m} index={i} />
              ))}
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#1f2740] p-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#1f2740] bg-[#111726] px-3 py-2">
          <button aria-label="Record voice note" className="text-[#8790a6] transition-colors hover:text-[#d4af37]">
            <Mic className="h-5 w-5" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
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
            aria-label="Send message"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37] text-[#0a0e1a] transition-colors hover:bg-[#e6c455]"
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

export function ChatView() {
  const [channel, setChannel] = useState("grip-chat")
  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-[#1f2740]">
      <div className="hidden w-56 shrink-0 sm:block">
        <ChannelList active={channel} onSelect={setChannel} />
      </div>
      <MessagePane channel={channel} />
      <MemberList />
    </div>
  )
}

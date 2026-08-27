"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { SmilePlus } from "lucide-react"
import type { ChatMessage } from "@/lib/platform/types"
import { REACTION_EMOJIS } from "@/lib/platform/types"
import { toggleReaction } from "@/lib/platform/actions"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function ReactionBar({ message, slug }: { message: ChatMessage; slug: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function react(emoji: string) {
    const fd = new FormData()
    fd.set("messageId", message.id)
    fd.set("emoji", emoji)
    fd.set("slug", slug)
    startTransition(() => {
      void toggleReaction(fd)
    })
    setOpen(false)
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {message.reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => react(r.emoji)}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            r.reactedByMe
              ? "border-accent bg-accent/15 text-foreground"
              : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground",
          )}
          aria-label={`React ${r.emoji}`}
        >
          <span>{r.emoji}</span>
          <span className="tabular-nums">{r.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          aria-label="Add reaction"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>
        {open && (
          <div className="absolute bottom-8 left-0 z-10 flex gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => react(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-base transition-transform hover:scale-125 hover:bg-secondary"
                aria-label={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function MessageList({ messages, slug }: { messages: ChatMessage[]; slug: string }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-mono text-sm tracking-widest text-muted-foreground">NO MESSAGES YET</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Be the first to post. Own the channel.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {messages.map((m) => (
        <div key={m.id} className="group flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-xs font-bold text-foreground">
            {initials(m.username)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-foreground">{m.username}</span>
              <span className="text-[11px] text-muted-foreground">{formatTime(m.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
              {m.content}
            </p>
            <ReactionBar message={m} slug={slug} />
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

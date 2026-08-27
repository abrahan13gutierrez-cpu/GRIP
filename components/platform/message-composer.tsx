"use client"

import type React from "react"
import { useRef, useState, useTransition } from "react"
import { SendHorizonal } from "lucide-react"
import { sendMessage } from "@/lib/platform/actions"

export function MessageComposer({
  channelId,
  slug,
  channelName,
}: {
  channelId: string
  slug: string
  channelName: string
}) {
  const [value, setValue] = useState("")
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function submit() {
    const content = value.trim()
    if (!content) return
    const fd = new FormData()
    fd.set("channelId", channelId)
    fd.set("slug", slug)
    fd.set("content", content)
    setValue("")
    startTransition(() => {
      void sendMessage(fd)
    })
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Respect CJK IME composition.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      ref={formRef}
      action={submit}
      className="border-t border-border bg-card px-4 py-3"
    >
      <div className="flex items-end gap-2 rounded-lg border border-border bg-input px-3 py-2 focus-within:border-muted-foreground">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={`Message #${channelName}`}
          className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-label={`Message ${channelName}`}
        />
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

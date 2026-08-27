"use client"

import { useState } from "react"
import { Hash, Menu, Radio, Users, X } from "lucide-react"
import type { Channel, ChatMessage, PinnedResource } from "@/lib/platform/types"
import { ChannelSidebar } from "./channel-sidebar"
import { InfoPanel } from "./info-panel"
import { MessageList } from "./message-list"
import { MessageComposer } from "./message-composer"

export function PlatformShell({
  channels,
  channel,
  pinned,
  messages,
}: {
  channels: Channel[]
  channel: Channel
  pinned: PinnedResource[]
  messages: ChatMessage[]
}) {
  const [navOpen, setNavOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Left sidebar - desktop */}
      <div className="hidden w-64 shrink-0 border-r border-border md:block">
        <ChannelSidebar channels={channels} activeSlug={channel.slug} />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary md:hidden"
            aria-label="Open channels"
          >
            <Menu className="h-5 w-5" />
          </button>

          {channel.is_broadcast ? (
            <Radio className="h-5 w-5 text-accent" aria-hidden="true" />
          ) : (
            <Hash className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">{channel.name}</h1>
            {channel.description && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {channel.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary xl:hidden"
            aria-label="Open channel info"
          >
            <Users className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageList messages={messages} slug={channel.slug} />
        </div>

        <MessageComposer channelId={channel.id} slug={channel.slug} channelName={channel.name} />
      </div>

      {/* Right info panel - desktop */}
      <div className="hidden w-72 shrink-0 border-l border-border xl:block">
        <InfoPanel channel={channel} pinned={pinned} />
      </div>

      {/* Mobile channel drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border shadow-xl">
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="absolute right-2 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              aria-label="Close channels"
            >
              <X className="h-5 w-5" />
            </button>
            <ChannelSidebar
              channels={channels}
              activeSlug={channel.slug}
              onNavigate={() => setNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile info drawer */}
      {infoOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setInfoOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 border-l border-border shadow-xl">
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
              className="absolute left-2 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              aria-label="Close channel info"
            >
              <X className="h-5 w-5" />
            </button>
            <InfoPanel channel={channel} pinned={pinned} />
          </div>
        </div>
      )}
    </div>
  )
}

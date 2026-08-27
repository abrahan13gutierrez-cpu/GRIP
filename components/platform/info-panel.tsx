import { Pin, Radio, Users } from "lucide-react"
import type { Channel, PinnedResource } from "@/lib/platform/types"

const DEMO_MEMBERS = [
  { name: "Coach Reyes", role: "HEAD COACH", online: true },
  { name: "Coach Diaz", role: "CATCHING", online: true },
  { name: "marcus_c", role: "CADET", online: true },
  { name: "jordan.p", role: "HERO", online: true },
  { name: "tyler_23", role: "CHAMPION", online: false },
  { name: "sam.rivera", role: "CADET", online: false },
]

export function InfoPanel({
  channel,
  pinned,
}: {
  channel: Channel
  pinned: PinnedResource[]
}) {
  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto bg-sidebar text-sidebar-foreground">
      {channel.is_broadcast && (
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="font-mono text-xs font-semibold tracking-[0.2em] text-sidebar-foreground">
              LIVE NOW
            </p>
            <span className="ml-auto flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-[10px] tracking-wider text-accent">ON AIR</span>
            </span>
          </div>
          <div className="mt-3 flex aspect-video items-center justify-center rounded-md border border-sidebar-border bg-background">
            <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
              DAILY BROADCAST
            </p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Receiving &amp; framing session — all campuses.
          </p>
        </div>
      )}

      <div className="border-b border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Pin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            PINNED
          </p>
        </div>
        {pinned.length === 0 ? (
          <p className="text-xs text-muted-foreground">No pinned resources.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pinned.map((p) => (
              <li key={p.id} className="rounded-md border border-sidebar-border bg-background p-3">
                <p className="text-sm font-semibold text-sidebar-foreground">{p.title}</p>
                {p.description && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            MEMBERS — {DEMO_MEMBERS.filter((m) => m.online).length} ONLINE
          </p>
        </div>
        <ul className="flex flex-col gap-1">
          {DEMO_MEMBERS.map((m) => (
            <li key={m.name} className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-secondary font-mono text-[10px] font-bold text-foreground">
                {m.name.slice(0, 2).toUpperCase()}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar ${
                    m.online ? "bg-accent" : "bg-muted-foreground"
                  }`}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-sidebar-foreground">{m.name}</span>
                <span className="block font-mono text-[9px] tracking-widest text-muted-foreground">
                  {m.role}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

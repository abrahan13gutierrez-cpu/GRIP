"use client"

import { Fragment, type ReactNode } from "react"
import { Flame, GraduationCap, MessageSquare, Trophy } from "lucide-react"
import { BADGES, EMOJI_PICKER, RANKS, type BadgeIcon, type Rank } from "@/lib/status/config"

const RANK_BY_ID = new Map(RANKS.map((r) => [r.id, r]))
const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]))

export function getRank(id: string | undefined): Rank {
  return (id && RANK_BY_ID.get(id)) || RANKS[0]
}

const SHAPES: Record<Rank["shape"], ReactNode> = {
  plate: <path d="M3 3h14v8l-7 6-7-6z" />,
  diamond: <path d="M10 2l8 8-8 8-8-8z" />,
  shield: <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5z" />,
  star: <path d="M10 2l2.4 5 5.6.6-4.2 3.8 1.2 5.6L10 14.2 5 17l1.2-5.6L2 7.6l5.6-.6z" />,
  crown: <path d="M2 6l4 3 4-6 4 6 4-3-2 10H4z" />,
}

export function RankBadge({ rankId, size = 14 }: { rankId: string; size?: number }) {
  const rank = getRank(rankId)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      role="img"
      aria-label={rank.label}
      className="shrink-0"
      style={{ color: rank.color }}
    >
      <title>{rank.label}</title>
      <g fill="currentColor" fillOpacity={0.22} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
        {SHAPES[rank.shape]}
      </g>
    </svg>
  )
}

const BADGE_ICONS: Record<BadgeIcon, typeof Flame> = {
  flame: Flame,
  graduation: GraduationCap,
  trophy: Trophy,
  message: MessageSquare,
}

export function BadgeIcons({ ids, max = 3, size = "sm" }: { ids: string[]; max?: number; size?: "sm" | "md" }) {
  const list = ids.slice(0, max).map((id) => BADGE_BY_ID.get(id)).filter(Boolean)
  if (!list.length) return null
  const box = size === "md" ? "h-6 w-6" : "h-4 w-4"
  const icon = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {list.map((b) => {
        const Icon = BADGE_ICONS[b!.icon]
        return (
          <span
            key={b!.id}
            title={`${b!.label} — ${b!.description}`}
            className={`flex ${box} items-center justify-center rounded-sm`}
            style={{ color: b!.color, backgroundColor: `${b!.color}22` }}
          >
            <Icon className={icon} strokeWidth={2.4} aria-hidden="true" />
            <span className="sr-only">{b!.label}</span>
          </span>
        )
      })}
    </span>
  )
}

export function RankName({ name, rankId, className = "" }: { name: string; rankId: string; className?: string }) {
  return (
    <span className={`truncate font-semibold ${className}`} style={{ color: getRank(rankId).color }}>
      {name}
    </span>
  )
}

/* ------------------------------- Rich text -------------------------------- */

const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_|@[\w-]+)/g

function renderInline(text: string, key: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const k = `${key}-${i}`
    if (!part) return null
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={k} className="font-semibold text-[color:var(--hud-text)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      if (part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith("@") && part.length > 1) {
      return (
        <span key={k} className="rounded-sm bg-[color:var(--grip-gold)]/15 px-0.5 font-medium text-[color:var(--grip-gold)]">
          {part}
        </span>
      )
    }
    return <Fragment key={k}>{part}</Fragment>
  })
}

type Block = { type: "p" | "ul" | "ol" | "quote"; lines: string[] }

function toBlocks(content: string): Block[] {
  const blocks: Block[] = []
  for (const line of content.split("\n")) {
    const type: Block["type"] = /^\s*[-*]\s+/.test(line)
      ? "ul"
      : /^\s*\d+[.)]\s+/.test(line)
        ? "ol"
        : /^\s*>\s?/.test(line)
          ? "quote"
          : "p"
    const text = line.replace(/^\s*([-*]|\d+[.)]|>)\s?/, type === "p" ? "$&" : "")
    const last = blocks[blocks.length - 1]
    if (last && last.type === type) last.lines.push(type === "p" ? line : text)
    else blocks.push({ type, lines: [type === "p" ? line : text] })
  }
  return blocks
}

export function RichText({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-1 text-pretty text-sm leading-relaxed text-[#c3cad9]">
      {toBlocks(content).map((b, i) => {
        const key = `b${i}`
        if (b.type === "ul" || b.type === "ol") {
          const List = b.type === "ul" ? "ul" : "ol"
          return (
            <List key={key} className={`flex flex-col gap-0.5 pl-5 ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
              {b.lines.map((l, j) => (
                <li key={j}>{renderInline(l, `${key}-${j}`)}</li>
              ))}
            </List>
          )
        }
        if (b.type === "quote") {
          return (
            <blockquote key={key} className="border-l-2 border-[color:var(--grip-gold)]/50 pl-3 text-[#a3abbf]">
              {b.lines.map((l, j) => (
                <p key={j}>{renderInline(l, `${key}-${j}`)}</p>
              ))}
            </blockquote>
          )
        }
        return (
          <p key={key} className="whitespace-pre-wrap break-words">
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && "\n"}
                {renderInline(l, `${key}-${j}`)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

/* ------------------------------ Emoji picker ------------------------------ */

export function EmojiPicker({
  onPick,
  onClose,
  className = "",
  label,
}: {
  onPick: (emoji: string) => void
  onClose: () => void
  className?: string
  label: string
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label={label}
        className={`absolute z-50 grid w-64 grid-cols-8 gap-0.5 rounded-xl border border-[#1f2740] bg-[#0d1322] p-2 shadow-xl shadow-black/40 ${className}`}
      >
        {EMOJI_PICKER.map((e) => (
          <button
            key={e}
            onClick={() => {
              onPick(e)
              onClose()
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-base transition-colors hover:bg-white/10"
          >
            {e}
          </button>
        ))}
      </div>
    </>
  )
}

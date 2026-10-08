"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Pin, X } from "lucide-react"
import { RANKS } from "@/lib/status/config"
import { authedFetch, type StatusMember } from "@/lib/status/client"
import { useT } from "@/i18n"
import { BadgeIcons, RankBadge, RankName, RichText, getRank } from "@/components/chat/status-ui"

type PinItem = {
  id: string
  user_id: string
  content: string
  created_at: string
  pinned_at: string
  author: string
  avatar_url: string | null
}

const pinsFetcher = (url: string) => authedFetch(url).then((r) => r.json())

export function usePins(channelId: string | null) {
  return useSWR<{ pins: PinItem[] }>(channelId ? `/api/status/pins?channelId=${channelId}` : null, pinsFetcher)
}

function MemberAvatar({ m }: { m: StatusMember }) {
  const color = getRank(m.rankId).color
  return (
    <div className="relative shrink-0">
      {m.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.avatar_url || "/placeholder.svg"} alt="" className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#131a2e] text-[10px] font-bold ring-1 ring-inset"
          style={{ color, boxShadow: `inset 0 0 0 1px ${color}40` }}
        >
          {m.initials}
        </div>
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[color:var(--grip-bg)] ${
          !m.online
            ? "bg-[#4b5468]"
            : m.status === "Away"
              ? "bg-[#F59E0B]"
              : m.status === "Training"
                ? "bg-[#5BC0EB]"
                : "bg-[#4ADE80]"
        }`}
        aria-hidden="true"
      />
    </div>
  )
}

export function MemberRow({ m }: { m: StatusMember }) {
  const t = useT()
  const status = m.online ? t(`status.${m.status as "Online" | "Training" | "Away"}`) : t("members.offline")
  const title = [getRank(m.rankId).label, m.streak > 0 ? t("members.streak", { n: m.streak }) : null]
    .filter(Boolean)
    .join(" · ")
  return (
    <li className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5 ${m.online ? "" : "opacity-50"}`}>
      <MemberAvatar m={m} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <RankName name={m.name} rankId={m.rankId} className="text-sm" />
          <RankBadge rankId={m.rankId} size={13} />
          <BadgeIcons ids={m.badges} max={3} />
        </div>
        <p className="truncate text-xs text-[#8790a6]">
          {status} · {title}
        </p>
      </div>
    </li>
  )
}

export function MembersPanel({
  members,
  loading,
  channelId,
  onClose,
}: {
  members: StatusMember[]
  loading: boolean
  channelId: string | null
  onClose?: () => void
}) {
  const t = useT()
  const [tab, setTab] = useState<"members" | "pinned">("members")
  const { data: pinsData } = usePins(tab === "pinned" ? channelId : null)

  const groups = useMemo(() => {
    const sorted = [...members].sort((a, b) => Number(b.online) - Number(a.online) || b.xp - a.xp)
    return [...RANKS]
      .reverse()
      .map((rank) => ({ rank, list: sorted.filter((m) => m.rankId === rank.id) }))
      .filter((g) => g.list.length > 0)
  }, [members])

  const onlineCount = members.filter((m) => m.online).length
  const tabClass = (active: boolean) =>
    `flex-1 border-b-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
      active
        ? "border-[color:var(--hud-cyan)] text-[color:var(--hud-text)]"
        : "border-transparent text-[#6b7591] hover:text-[#c3cad9]"
    }`

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pt-4">
        <div role="tablist" className="flex flex-1 gap-3">
          <button role="tab" aria-selected={tab === "members"} onClick={() => setTab("members")} className={tabClass(tab === "members")}>
            {t("members.title")}
          </button>
          <button role="tab" aria-selected={tab === "pinned"} onClick={() => setTab("pinned")} className={tabClass(tab === "pinned")}>
            {t("chat.pinned")}
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label={t("members.close")}
            className="-mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {tab === "members" ? (
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-2 pb-2 text-xs text-[#6b7591]">{t("members.online", { n: onlineCount })}</p>
          {loading && members.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-[#6b7591]">{t("members.loading")}</p>
          ) : (
            groups.map(({ rank, list }) => (
              <section key={rank.id} className="mb-4">
                <h3 className="flex items-center gap-1.5 px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--hud-cyan)]">
                  <RankBadge rankId={rank.id} size={12} />
                  {rank.label} — {list.length}
                </h3>
                <ul className="flex flex-col">
                  {list.map((m) => (
                    <MemberRow key={m.id} m={m} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {(pinsData?.pins ?? []).length === 0 ? (
            <p className="px-2 py-10 text-center text-xs text-[#6b7591]">{t("chat.noPinned")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pinsData!.pins.map((p) => {
                const member = members.find((m) => m.id === p.user_id)
                return (
                  <li key={p.id} className="rounded-lg border border-[#1f2740] bg-[#111726] p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Pin className="h-3 w-3 text-[color:var(--grip-gold)]" aria-hidden="true" />
                      <RankName name={member?.name ?? p.author} rankId={member?.rankId ?? "rookie"} className="text-xs" />
                      <RankBadge rankId={member?.rankId ?? "rookie"} size={11} />
                    </div>
                    <RichText content={p.content} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

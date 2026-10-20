"use client"

import { useState } from "react"
import { Flame } from "lucide-react"
import { useT } from "@/i18n"
import { authedFetch, useStatus } from "@/lib/status/client"
import { BADGES, STATUS_OPTIONS, rankProgress, type StatusText } from "@/lib/status/config"
import { BadgeIcons, RankBadge } from "@/components/chat/status-ui"

const OSWALD = "font-[family-name:var(--font-oswald)]"

export function RankCard() {
  const t = useT()
  const { data, mutate } = useStatus()
  const [saving, setSaving] = useState(false)
  const me = data?.me

  if (!me) return <div className="mt-4 h-40 animate-pulse rounded-2xl bg-[#111726]" />

  const { rank, next, pct, toNext } = rankProgress(me.xp)
  const earned = BADGES.filter((b) => me.badges.includes(b.id))
  const currentStatus: StatusText = me.status_text ?? "Online"

  async function setStatus(status: StatusText) {
    if (status === currentStatus) return
    setSaving(true)
    await authedFetch("/api/status", { method: "PATCH", body: JSON.stringify({ status_text: status }) })
    await mutate()
    setSaving(false)
  }

  return (
    <section
      aria-labelledby="rank-card-title"
      className="mt-4 rounded-2xl border border-[#1f2740] bg-[#111726] p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="rank-card-title" className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--hud-cyan,#5BC0EB)]">
          {t("profile.rank")}
        </h2>
        {me.streak > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold text-[#F59E0B]">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {me.streak}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <RankBadge rankId={rank.id} size={36} />
        <div className="min-w-0 flex-1">
          <div className={`${OSWALD} text-xl uppercase tracking-wide`} style={{ color: rank.color }}>
            {rank.label}
          </div>
          <div className="text-xs text-[#8790a6]">{t("profile.xp", { n: me.xp.toLocaleString("en-US") })}</div>
        </div>
      </div>

      <div className="mt-4">
        <div
          className="h-2 overflow-hidden rounded-full bg-[#1f2740]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={next ? t("profile.toNext", { n: toNext, rank: next.label }) : t("profile.maxRank")}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: next?.color ?? rank.color }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8790a6]">
          <span>{next ? t("profile.toNext", { n: toNext, rank: next.label }) : t("profile.maxRank")}</span>
          <span className="font-semibold text-[#c7cdd6]">{pct}%</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8790a6]">{t("profile.badges")}</h3>
        {earned.length ? (
          <ul className="flex flex-wrap gap-2">
            {earned.map((b) => (
              <li
                key={b.id}
                title={b.description}
                className="flex items-center gap-2 rounded-full border border-[#1f2740] bg-[#0d1220] py-1 pl-1 pr-3 text-xs text-[#c7cdd6]"
              >
                <BadgeIcons ids={[b.id]} max={1} size="md" />
                {b.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-pretty text-sm leading-relaxed text-[#8790a6]">{t("profile.noBadges")}</p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8790a6]">{t("profile.status")}</h3>
        <div role="radiogroup" aria-label={t("profile.status")} className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => {
            const selected = s === currentStatus
            return (
              <button
                key={s}
                role="radio"
                aria-checked={selected}
                disabled={saving}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                  selected
                    ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#d4af37]"
                    : "border-[#1f2740] bg-[#0d1220] text-[#8790a6] hover:text-[#e8ebf2]"
                }`}
              >
                {t(`status.${s}`)}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

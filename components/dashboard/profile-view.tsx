"use client"

import { useState } from "react"
import useSWR from "swr"
import { Settings, Zap, Flame, Trophy, Video, Target, Check, Lock } from "lucide-react"
import { AccountSettings } from "@/components/dashboard/account-settings"

const OSWALD = "font-[family-name:var(--font-oswald)]"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export type ProfileData = {
  profile: {
    username: string
    email: string | null
    phone: string | null
    phoneVerified: boolean
    avatarUrl: string | null
    nivel: string
    powerPoints: number
    loginStreak: number
    bio: string | null
    createdAt: string | null
  }
  stats: {
    protocolDone: number
    protocolTotal: number
    protocolPct: number
    missionsDone: number
    videosWatched: number
    nextLevel: string | null
  }
  journey: { key: string; name: string; tag: string; status: "done" | "current" | "locked"; completedAt: string | null }[]
}

type Tab = "info" | "journey" | "stats"

const TABS: { id: Tab; label: string }[] = [
  { id: "info", label: "Información" },
  { id: "journey", label: "Mi Recorrido" },
  { id: "stats", label: "Estadísticas" },
]

function initials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return "—"
  }
}

export function ProfileView() {
  const { data, mutate, isLoading } = useSWR<ProfileData>("/api/profile", fetcher)
  const [tab, setTab] = useState<Tab>("info")
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (isLoading || !data?.profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="h-40 animate-pulse rounded-2xl bg-[#111726]" />
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-[#111726]" />
      </div>
    )
  }

  const { profile, stats, journey } = data
  const powerLevel = Math.max(1, journey.findIndex((r) => r.status === "current") + 1)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
      {/* ============ TARJETA DE PERFIL ============ */}
      <section className="overflow-hidden rounded-2xl border border-[#1f2740] bg-[#111726]">
        {/* Banner */}
        <div className="relative h-28 bg-gradient-to-r from-[#3a2f10] via-[#d4af37]/30 to-[#0a0e1a]">
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Abrir ajustes de cuenta"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-[#e8ebf2] backdrop-blur transition-colors hover:bg-black/50"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* Avatar + identidad */}
          <div className="-mt-10 flex items-end gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#111726] bg-[#1a2136] text-2xl font-bold text-[#d4af37]">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl || "/placeholder.svg"} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  initials(profile.username)
                )}
              </div>
              <span
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#111726] bg-[#2fbf71]"
                aria-label="En línea"
              />
            </div>
            <div className="mb-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`${OSWALD} truncate text-xl uppercase tracking-wide text-[#e8ebf2]`}>
                  {profile.username}
                </h1>
                <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#d4af37]">
                  {profile.nivel}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progreso + power points */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="uppercase tracking-wider text-[#8790a6]">
                {profile.nivel} en curso
                {stats.nextLevel && <span className="text-[#4d545e]"> → {stats.nextLevel}</span>}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#d4af37]">
                <Zap className="h-3.5 w-3.5 fill-current" />
                {profile.powerPoints.toLocaleString("es-MX")} PP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1f2740]">
              <div
                className="h-full rounded-full bg-[#d4af37] transition-all"
                style={{ width: `${stats.protocolPct}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] font-medium text-[#8790a6]">{stats.protocolPct}%</div>
          </div>

          {/* Bio */}
          <p className="mt-2 text-pretty text-sm leading-relaxed text-[#c7cdd6]">
            {profile.bio || "Aún no has escrito una bio. Ábrela desde Ajustes → Mi Cuenta."}
          </p>
        </div>
      </section>

      {/* ============ TABS ============ */}
      <div className="mt-5 flex gap-1 border-b border-[#1f2740]">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "text-[#d4af37]" : "text-[#8790a6] hover:text-[#e8ebf2]"
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#d4af37]" />}
            </button>
          )
        })}
      </div>

      <div className="py-5">
        {tab === "info" && (
          <div className="space-y-6">
            {/* Stats rápidas */}
            <div className="grid grid-cols-3 gap-3">
              <StatChip icon={Trophy} label="Power Level" value={String(powerLevel)} />
              <StatChip icon={Zap} label="Power Points" value={profile.powerPoints.toLocaleString("es-MX")} />
              <StatChip icon={Flame} label="Login Streak" value={`${profile.loginStreak}+ días`} />
            </div>

            {/* Chips informativos */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8790a6]">Perfil de jugador</h3>
              <div className="flex flex-wrap gap-2">
                <InfoChip>Catcher</InfoChip>
                <InfoChip>Triple-A</InfoChip>
                <InfoChip>4 días/semana</InfoChip>
                <InfoChip>Miembro desde {formatDate(profile.createdAt)}</InfoChip>
              </div>
            </div>

            {/* Roles */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8790a6]">Roles</h3>
              <div className="flex flex-wrap gap-2">
                <RoleChip>Miembro</RoleChip>
                <RoleChip>Catcher</RoleChip>
              </div>
            </div>
          </div>
        )}

        {tab === "journey" && (
          <div>
            <p className="mb-4 text-sm text-[#8790a6]">Tu camino de Rookie a Commander.</p>
            <ol className="relative border-l border-[#1f2740] pl-6">
              {journey.map((r) => (
                <li key={r.key} className="mb-6 last:mb-0">
                  <span
                    className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[#0a0e1a] ${
                      r.status === "done"
                        ? "bg-[#2fbf71]"
                        : r.status === "current"
                          ? "bg-[#d4af37]"
                          : "bg-[#1f2740]"
                    }`}
                  >
                    {r.status === "done" ? (
                      <Check className="h-2.5 w-2.5 text-[#0a0e1a]" strokeWidth={3} />
                    ) : r.status === "locked" ? (
                      <Lock className="h-2 w-2 text-[#4d545e]" />
                    ) : null}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={`${OSWALD} text-base uppercase tracking-wide ${
                        r.status === "locked" ? "text-[#4d545e]" : "text-[#e8ebf2]"
                      }`}
                    >
                      {r.name}
                    </h4>
                    {r.status === "current" && (
                      <span className="rounded-full bg-[#d4af37]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#d4af37]">
                        En curso
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8790a6]">{r.tag}</div>
                  {r.completedAt && r.status !== "locked" && (
                    <div className="mt-0.5 font-mono text-[10.5px] text-[#4d545e]">
                      {r.status === "done" ? "Completado" : "Última actividad"} · {formatDate(r.completedAt)}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === "stats" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard icon={Target} label="Drills completados" value={String(stats.missionsDone)} />
            <MetricCard icon={Video} label="Videos vistos" value={String(stats.videosWatched)} />
            <MetricCard
              icon={Trophy}
              label="Protocolo completado"
              value={`${stats.protocolPct}%`}
              sub={`${stats.protocolDone}/${stats.protocolTotal} casillas`}
            />
          </div>
        )}
      </div>

      {settingsOpen && (
        <AccountSettings
          profile={profile}
          onClose={() => setSettingsOpen(false)}
          onSaved={() => mutate()}
        />
      )}
    </div>
  )
}

function StatChip({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1f2740] bg-[#0d1220] p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-[#d4af37]" />
      <div className={`${OSWALD} text-lg text-[#e8ebf2]`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-[#8790a6]">{label}</div>
    </div>
  )
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#1f2740] bg-[#0d1220] px-3 py-1 text-xs text-[#c7cdd6]">
      {children}
    </span>
  )
}

function RoleChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
      {children}
    </span>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Zap
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-[#1f2740] bg-[#111726] p-5">
      <Icon className="mb-3 h-5 w-5 text-[#d4af37]" />
      <div className={`${OSWALD} text-2xl text-[#e8ebf2]`}>{value}</div>
      <div className="mt-1 text-xs text-[#8790a6]">{label}</div>
      {sub && <div className="mt-0.5 font-mono text-[10.5px] text-[#4d545e]">{sub}</div>}
    </div>
  )
}

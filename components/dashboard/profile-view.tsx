"use client"

import { useState } from "react"
import useSWR from "swr"
import { Settings } from "lucide-react"
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
    bio: string | null
    createdAt: string | null
  }
}

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
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (isLoading || !data?.profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="h-40 animate-pulse rounded-2xl bg-[#111726]" />
      </div>
    )
  }

  const { profile } = data

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
                  Catcher
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-pretty text-sm leading-relaxed text-[#c7cdd6]">
            {profile.bio || "Aún no has escrito una bio. Ábrela desde Ajustes → Mi Cuenta."}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#1f2740] pt-4">
            <span className="text-xs text-[#8790a6]">
              Miembro desde {formatDate(profile.createdAt)}
            </span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-[#1f2740] bg-[#0d1220] px-3.5 py-1.5 text-xs font-semibold text-[#e8ebf2] transition-colors hover:border-[#d4af37]"
            >
              Ajustes de cuenta
            </button>
          </div>
        </div>
      </section>

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

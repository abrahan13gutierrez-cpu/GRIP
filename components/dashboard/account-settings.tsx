"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, User, Bell, IdCard, MonitorSmartphone, CreditCard, SlidersHorizontal, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ProfileData } from "@/components/dashboard/profile-view"

const OSWALD = "font-[family-name:var(--font-oswald)]"

type SectionId = "account" | "notifications" | "profile" | "devices" | "membership" | "advanced"

const SECTIONS: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: "account", label: "Mi Cuenta", icon: User },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "profile", label: "Perfil", icon: IdCard },
  { id: "devices", label: "Dispositivos Conectados", icon: MonitorSmartphone },
  { id: "membership", label: "Mi Membresía", icon: CreditCard },
  { id: "advanced", label: "Avanzado", icon: SlidersHorizontal },
]

export function AccountSettings({
  profile,
  onClose,
  onSaved,
}: {
  profile: ProfileData["profile"]
  onClose: () => void
  onSaved: () => void
}) {
  const router = useRouter()
  const [section, setSection] = useState<SectionId>("account")
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ajustes de cuenta"
      onClick={onClose}
    >
      <div
        className="flex h-[560px] max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#1f2740] bg-[#0d1220]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lista lateral */}
        <nav className="flex w-44 shrink-0 flex-col border-r border-[#1f2740] bg-[#0a0e1a] p-2 sm:w-52">
          <div className="px-2 py-3">
            <span className={`${OSWALD} text-sm uppercase tracking-wide text-[#8790a6]`}>Ajustes</span>
          </div>
          <div className="flex-1 space-y-0.5 overflow-y-auto">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const active = section === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                    active ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-[#8790a6] hover:bg-white/5 hover:text-[#e8ebf2]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-[#ff5c5c] transition-colors hover:bg-[#ff5c5c]/10 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </nav>

        {/* Contenido */}
        <div className="relative min-w-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-lg border border-[#1f2740] p-1.5 text-[#8790a6] transition-colors hover:text-[#e8ebf2]"
          >
            <X className="h-4 w-4" />
          </button>

          {section === "account" ? (
            <AccountSection profile={profile} onSaved={onSaved} />
          ) : (
            <PlaceholderSection label={SECTIONS.find((s) => s.id === section)?.label ?? ""} />
          )}
        </div>
      </div>
    </div>
  )
}

function AccountSection({ profile, onSaved }: { profile: ProfileData["profile"]; onSaved: () => void }) {
  const [username, setUsername] = useState(profile.username)
  const [email, setEmail] = useState(profile.email ?? "")
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  const [pwOpen, setPwOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  async function saveProfile() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error ?? "No se pudo guardar")
      }

      // El email vive en Supabase Auth, no en la tabla profiles.
      if (email && email !== profile.email) {
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ email })
        if (error) throw new Error(error.message)
        setMsg({ kind: "ok", text: "Perfil guardado. Revisa tu correo para confirmar el nuevo email." })
      } else {
        setMsg({ kind: "ok", text: "Cambios guardados." })
      }
      onSaved()
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Error al guardar" })
    } finally {
      setSaving(false)
    }
  }

  async function savePassword() {
    if (password.length < 6) {
      setMsg({ kind: "err", text: "La contraseña debe tener al menos 6 caracteres." })
      return
    }
    setPwSaving(true)
    setMsg(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(error.message)
      setPassword("")
      setPwOpen(false)
      setMsg({ kind: "ok", text: "Contraseña actualizada." })
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Error al cambiar contraseña" })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className={`${OSWALD} mb-1 text-lg uppercase tracking-wide text-[#e8ebf2]`}>Mi Cuenta</h2>
      <p className="mb-5 text-sm text-[#8790a6]">Administra tu información de inicio de sesión.</p>

      <div className="space-y-4">
        <Field label="Username">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-[#1f2740] bg-[#0a0e1a] px-3 py-2 text-sm text-[#e8ebf2] outline-none focus:border-[#d4af37]"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#1f2740] bg-[#0a0e1a] px-3 py-2 text-sm text-[#e8ebf2] outline-none focus:border-[#d4af37]"
          />
        </Field>
        <Field label="Teléfono">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52..."
            className="w-full rounded-lg border border-[#1f2740] bg-[#0a0e1a] px-3 py-2 text-sm text-[#e8ebf2] outline-none placeholder:text-[#4d545e] focus:border-[#d4af37]"
          />
        </Field>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-[#0a0e1a] transition-colors hover:bg-[#e0bd4a] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <div className="border-t border-[#1f2740] pt-4">
          {!pwOpen ? (
            <button
              onClick={() => setPwOpen(true)}
              className="rounded-lg border border-[#1f2740] px-4 py-2 text-sm font-medium text-[#e8ebf2] transition-colors hover:border-[#3a424d]"
            >
              Cambiar contraseña
            </button>
          ) : (
            <div className="space-y-3">
              <Field label="Nueva contraseña">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#1f2740] bg-[#0a0e1a] px-3 py-2 text-sm text-[#e8ebf2] outline-none focus:border-[#d4af37]"
                />
              </Field>
              <div className="flex gap-2">
                <button
                  onClick={savePassword}
                  disabled={pwSaving}
                  className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-[#0a0e1a] transition-colors hover:bg-[#e0bd4a] disabled:opacity-60"
                >
                  {pwSaving ? "Guardando..." : "Actualizar"}
                </button>
                <button
                  onClick={() => {
                    setPwOpen(false)
                    setPassword("")
                  }}
                  className="rounded-lg border border-[#1f2740] px-4 py-2 text-sm text-[#8790a6] transition-colors hover:text-[#e8ebf2]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {msg && (
          <p className={`text-sm ${msg.kind === "ok" ? "text-[#2fbf71]" : "text-[#ff5c5c]"}`}>{msg.text}</p>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8790a6]">{label}</span>
      {children}
    </label>
  )
}

function PlaceholderSection({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h2 className={`${OSWALD} mb-2 text-lg uppercase tracking-wide text-[#e8ebf2]`}>{label}</h2>
      <p className="max-w-xs text-sm text-[#8790a6]">Esta sección estará disponible pronto.</p>
      <span className="mt-4 rounded-full border border-[#1f2740] bg-[#111726] px-3 py-1 text-xs font-medium text-[#d4af37]">
        Próximamente
      </span>
    </div>
  )
}

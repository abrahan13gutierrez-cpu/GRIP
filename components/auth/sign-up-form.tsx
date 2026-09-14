'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AMBER_BUTTON } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function SignUpForm() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (fullName.trim().length < 2) {
      setError('Ingresa tu nombre completo.')
      return
    }
    if (username.trim().length < 3) {
      setError('El usuario debe tener al menos 3 caracteres.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    // 1) Create the account + profile row on the server (username/phone/name).
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      }),
    })

    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
      setLoading(false)
      if (payload.needsConfirmation) {
        setNotice('Revisa tu correo para confirmar tu cuenta.')
        return
      }
      setError(payload.error ?? 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
      return
    }

    // 2) Sign in immediately so a session exists, then enter the platform.
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setNotice('Revisa tu correo para confirmar tu cuenta.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (notice) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {notice}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="catcher_09"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Número de teléfono</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Al menos 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className={cn('mt-1 h-11 w-full', AMBER_BUTTON)}
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
        {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    </form>
  )
}

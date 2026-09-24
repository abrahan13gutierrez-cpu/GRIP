'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AMBER_BUTTON } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    // Route the recovery link through the v0 redirect proxy (its host is the
    // one allow-listed in Supabase), then hand off to /auth/callback, which
    // exchanges the code for a session and forwards to the reset screen.
    const base =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${window.location.origin}/auth/callback`
    const redirectTo = `${base}${base.includes('?') ? '&' : '?'}next=${encodeURIComponent('/auth/reset-password')}`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    )
    setLoading(false)
    if (resetError) {
      setError('No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Te enviamos un link para restablecer tu contraseña. Revisa tu correo
          y sigue el enlace para crear una nueva.
        </p>
        <Link
          href="/auth/login"
          className="text-sm text-foreground underline-offset-4 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className={cn('mt-1 h-11 w-full', AMBER_BUTTON)}
      >
        {loading ? 'Enviando...' : 'Enviar enlace'}
        {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    </form>
  )
}

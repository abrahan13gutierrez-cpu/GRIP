'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AMBER_BUTTON } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // The recovery link drops a temporary session; wait for it before allowing
  // the update so we can tell "link expired" apart from a normal error.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('El enlace expiró o no es válido. Solicita uno nuevo.')
      return
    }

    setDone(true)
    setTimeout(() => {
      window.location.assign('/dashboard')
    }, 1200)
  }

  if (done) {
    return (
      <p className="text-center text-sm leading-relaxed text-muted-foreground text-pretty">
        Contraseña actualizada. Entrando a GRIP...
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!ready && (
        <p className="text-sm text-muted-foreground text-pretty">
          Abre esta página desde el enlace que te enviamos por correo para
          restablecer tu contraseña.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Nueva contraseña</Label>
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        {loading ? 'Guardando...' : 'Guardar contraseña'}
        {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/auth/login"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </form>
  )
}

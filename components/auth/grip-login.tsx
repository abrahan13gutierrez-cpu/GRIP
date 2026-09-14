'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GripLogo } from '@/components/grip-logo'
import { MatrixRain } from '@/components/auth/matrix-rain'
import { AuthCard, AMBER_BUTTON } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const PHRASES = [
  'La disciplina le gana al talento cuando el talento no se disciplina.',
  'El catcher no espera el juego. Lo dirige.',
  'Cada pitch es una decisión. Cada decisión, una ventaja.',
  'La mente firme sostiene el brazo firme.',
  'Nadie ve el trabajo silencioso, pero todos ven el resultado.',
  'El control no se hereda, se entrena.',
  'Domina el conteo antes de que el conteo te domine a ti.',
  'Preparar. Liderar. Ejecutar. Repetir.',
]

type Phase = 'loading' | 'form'
type Method = 'email' | 'phone'
type PhoneStep = 'enter' | 'otp'

export function GripLogin() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [visible, setVisible] = useState(false)

  // Pick the phrase only on the client so SSR and hydration stay in sync
  // (a random pick during render would mismatch the server-rendered HTML).
  const [phrase, setPhrase] = useState(PHRASES[0])

  useEffect(() => {
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)])

    // Fade the loader in immediately, then hand off to the form.
    const fadeIn = setTimeout(() => setVisible(true), 30)
    const toForm = setTimeout(() => setVisible(false), 2600)
    const swap = setTimeout(() => {
      setPhase('form')
      setVisible(true)
    }, 3100)
    return () => {
      clearTimeout(fadeIn)
      clearTimeout(toForm)
      clearTimeout(swap)
    }
  }, [])

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Code-rain backdrop: prominent during loading, tenue behind the form. */}
      <MatrixRain
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700',
          phase === 'loading' ? 'opacity-100' : 'opacity-25',
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,transparent,oklch(0.135_0.003_260)_75%)]"
      />

      {phase === 'loading' ? (
        <LoadingScreen phrase={phrase} visible={visible} />
      ) : (
        <LoginCard visible={visible} />
      )}
    </main>
  )
}

function LoadingScreen({
  phrase,
  visible,
}: {
  phrase: string
  visible: boolean
}) {
  return (
    <div
      className={cn(
        'relative z-10 flex flex-col items-center text-center transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <GripLogo size={72} showWordmark={false} className="mb-8" />

      <div className="mb-5 flex items-center gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-[oklch(0.8_0.14_85)]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="font-mono text-lg font-bold tracking-[0.22em] text-foreground">
        ENTRANDO A GRIP
      </p>

      <p className="mt-4 max-w-xs text-pretty text-sm italic leading-relaxed text-muted-foreground">
        {`"${phrase}"`}
      </p>
    </div>
  )
}

function LoginCard({ visible }: { visible: boolean }) {
  const router = useRouter()
  const [method, setMethod] = useState<Method>('email')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function resetFeedback() {
    setError(null)
    setNotice(null)
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()
    setLoading(true)
    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (loginError) {
      setLoading(false)
      if (loginError.message.toLowerCase().includes('email not confirmed')) {
        setError('Confirma tu correo antes de iniciar sesión.')
      } else if (loginError.status === 429) {
        setError('Demasiados intentos. Espera un momento e inténtalo de nuevo.')
      } else {
        setError('Correo o contraseña inválidos.')
      }
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()
    setLoading(true)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
    })
    setLoading(false)
    if (otpError) {
      setError('No pudimos enviar el código. Verifica tu número.')
      return
    }
    setPhoneStep('otp')
    setNotice('Te enviamos un código por SMS.')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()
    setLoading(true)
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: 'sms',
    })
    if (verifyError) {
      setLoading(false)
      setError('Código incorrecto o expirado.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  function switchMethod(next: Method) {
    resetFeedback()
    setMethod(next)
    setPhoneStep('enter')
  }

  return (
    <div
      className={cn(
        'relative z-10 w-full max-w-md transition-all duration-500',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      <AuthCard
        title="Inicia sesión en GRIP"
        backHref="/"
        footer={
          <>
            {'¿No tienes cuenta? '}
            <Link
              href="/auth/sign-up"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Regístrate
            </Link>
          </>
        }
      >
        {/* Method toggle */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-background/60 p-1">
          {(['email', 'phone'] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMethod(m)}
              className={cn(
                'rounded-md py-2 text-sm font-medium transition-colors',
                method === m
                  ? 'bg-[oklch(0.8_0.14_85)] text-[oklch(0.2_0.02_85)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'email' ? 'Email' : 'Número de teléfono'}
            </button>
          ))}
        </div>

        {method === 'email' ? (
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
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
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => switchMethod('phone')}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Usar código SMS
              </button>
              <Link
                href="/auth/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        ) : phoneStep === 'enter' ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
              <p className="text-xs text-muted-foreground">
                Te enviaremos un código de un solo uso por SMS.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className={cn('mt-1 h-11 w-full', AMBER_BUTTON)}
            >
              {loading ? 'Enviando código...' : 'Enviar código'}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => switchMethod('email')}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Usar email y contraseña
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Código SMS</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-11 tracking-[0.4em]"
              />
              <p className="text-xs text-muted-foreground">Enviado a {phone}</p>
            </div>

            {notice && !error && (
              <p className="text-sm text-[oklch(0.8_0.14_85)]">{notice}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className={cn('mt-1 h-11 w-full', AMBER_BUTTON)}
            >
              {loading ? 'Verificando...' : 'Verificar y entrar'}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  resetFeedback()
                  setPhoneStep('enter')
                  setCode('')
                }}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Cambiar número
              </button>
              <button
                type="button"
                onClick={handleSendOtp as unknown as () => void}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </div>
  )
}

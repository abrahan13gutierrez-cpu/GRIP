'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'account' | 'verify'

export function SignUpForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleAccount(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: { username: username.trim(), phone: phone.trim() },
      },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    // If email confirmation is required there is no session yet.
    if (!data.session) {
      setLoading(false)
      router.push('/auth/sign-up-success')
      return
    }

    // Session exists — attempt to send the phone verification code.
    const { error: phoneError } = await supabase.auth.updateUser({
      phone: phone.trim(),
    })
    setLoading(false)

    if (phoneError) {
      // SMS provider not configured or number rejected — let them into the app.
      setNotice(
        'Your account is ready. Phone verification is temporarily unavailable — you can verify later from your profile.',
      )
      setTimeout(() => router.push('/'), 1800)
      return
    }

    setStep('verify')
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'phone_change',
    })

    if (verifyError) {
      setLoading(false)
      setError(verifyError.message)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ phone_verified: true })
        .eq('id', user.id)
    }

    setLoading(false)
    router.push('/')
  }

  async function resendCode() {
    setError(null)
    setNotice(null)
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.updateUser({
      phone: phone.trim(),
    })
    if (resendError) setError(resendError.message)
    else setNotice('A new code has been sent.')
  }

  if (step === 'verify') {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="h-11 text-center font-mono text-lg tracking-[0.5em]"
          />
          <p className="text-xs text-muted-foreground">
            {'Enter the code we texted to '}
            <span className="text-foreground">{phone}</span>.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-primary">{notice}</p>}

        <Button type="submit" disabled={loading} className="h-11 w-full">
          {loading ? 'Verifying...' : 'Verify & enter'}
        </Button>
        <button
          type="button"
          onClick={resendCode}
          className="text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Resend code
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleAccount} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
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
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
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
          Used to verify your account by SMS.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {notice && <p className="text-sm text-primary">{notice}</p>}

      <Button type="submit" disabled={loading} className="mt-2 h-11 w-full">
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {'Already a member? '}
        <Link
          href="/auth/login"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  )
}

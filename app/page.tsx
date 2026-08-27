import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GripLogo } from '@/components/grip-logo'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const username = (user.user_metadata?.username as string) ?? 'Catcher'

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <GripLogo size={72} />
      <div>
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em]">
          {`WELCOME, ${username.toUpperCase()}`}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          You&apos;re in. The campus platform is being built next.
        </p>
      </div>
      <LogoutButton />
    </main>
  )
}

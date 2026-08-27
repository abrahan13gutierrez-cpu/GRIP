import type { ReactNode } from 'react'
import { GripLogo } from '@/components/grip-logo'

export function AuthShell({
  children,
  heading,
  subheading,
}: {
  children: ReactNode
  heading: string
  subheading: string
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Cinematic backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.22_0.01_260),oklch(0.135_0.003_260)_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <GripLogo size={64} showWordmark={false} className="mb-5" />
          <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-foreground text-balance">
            {heading}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            {subheading}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
          PREPARE. LEAD. EXECUTE. REPEAT.
        </p>
      </div>
    </main>
  )
}

'use client'

import type { ReactNode } from 'react'
import { MatrixRain } from '@/components/auth/matrix-rain'
import { cn } from '@/lib/utils'

/**
 * Single shared layout for every auth step (login form, sign-up, reset).
 * Renders the same tenue code-rain backdrop + vignette + centered card slot,
 * so moving between steps never jumps to a different design.
 */
export function AuthScreen({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <MatrixRain className="pointer-events-none absolute inset-0 h-full w-full opacity-25" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,transparent,oklch(0.135_0.003_260)_75%)]"
      />
      <div className={cn('relative z-10 w-full max-w-md', className)}>
        {children}
      </div>
    </main>
  )
}

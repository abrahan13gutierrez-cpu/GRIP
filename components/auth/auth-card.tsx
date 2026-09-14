'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/** Shared amber CTA styling used by every auth button. */
export const AMBER_BUTTON =
  'bg-[oklch(0.8_0.14_85)] text-[oklch(0.2_0.02_85)] hover:bg-[oklch(0.75_0.14_85)]'

/**
 * The card chrome shared by all auth steps: back link, title, body slot, and
 * an optional footer rendered below the card. Keeping this in one place is
 * what guarantees login / sign-up / reset look like the same family.
 */
export function AuthCard({
  title,
  backHref = '/auth/login',
  backLabel = 'Volver',
  children,
  footer,
}: {
  title: string
  backHref?: string
  backLabel?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <>
      <div className="rounded-xl border border-border bg-card/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <h1 className="mb-6 font-mono text-2xl font-bold tracking-[0.12em] text-foreground text-balance">
          {title}
        </h1>

        {children}
      </div>

      {footer && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      )}
    </>
  )
}

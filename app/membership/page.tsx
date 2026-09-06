import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { GripLogo } from "@/components/grip-logo"
import { PricingCard } from "@/components/platform/pricing-card"
import { PLANS } from "@/lib/platform/plans"

export default async function MembershipPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <GripLogo size={40} />
          <Link
            href="/channels/welcome"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to campus
          </Link>
        </div>

        <header className="mb-10 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-accent">OWN THE GAME</p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose your membership
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Train across every GRIP campus with daily live coaching. Level up from Cadet to Champion.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-lg border border-border bg-card p-5">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">30-Day Confidence Guarantee</p>
            <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              Train with GRIP for 30 days. If you are not more confident behind the plate, contact us
              for a full refund. No risk — just reps.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prices in USD. Membership renews automatically at the selected cadence until cancelled.
        </p>
      </div>
    </main>
  )
}

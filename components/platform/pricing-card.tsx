"use client"

import { Check } from "lucide-react"
import type { Plan } from "@/lib/platform/plans"
import { cn } from "@/lib/utils"

export function PricingCard({ plan }: { plan: Plan }) {
  function goToCheckout() {
    // If embedded in an iframe (e.g. the v0 preview), open in a new tab.
    if (typeof window !== "undefined" && window.self !== window.top) {
      window.open(plan.checkoutUrl, "_blank", "noopener,noreferrer")
    } else {
      window.location.href = plan.checkoutUrl
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card p-6",
        plan.featured ? "border-accent shadow-[0_0_0_1px_var(--color-accent)]" : "border-border",
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 font-mono text-[10px] font-bold tracking-[0.2em] text-accent-foreground">
          MOST POPULAR
        </span>
      )}

      <h3 className="font-mono text-lg font-bold tracking-[0.2em] text-foreground">{plan.name}</h3>
      <p className="mt-1 font-mono text-[11px] tracking-widest text-muted-foreground">{plan.billed}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
        <span className="text-sm text-muted-foreground">{plan.cadence}</span>
      </div>
      {plan.save && <p className="mt-1 text-xs font-semibold text-accent">{plan.save}</p>}

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={goToCheckout}
        className={cn(
          "mt-6 w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90",
          plan.featured
            ? "bg-accent text-accent-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        Choose {plan.name.replace("'S", "'s").split(" ")[0]}
      </button>
    </div>
  )
}

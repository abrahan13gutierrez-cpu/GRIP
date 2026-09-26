export type Plan = {
  id: string
  name: string
  price: string
  cadence: string
  billed: string
  save: string | null
  features: string[]
  featured: boolean
  checkoutUrl: string
}

export const PLANS: Plan[] = [
  {
    id: "founders",
    name: "GRIP FOUNDERS",
    price: "$30",
    cadence: "/month",
    billed: "Billed monthly",
    save: null,
    features: [
      "Framing Mastery — full 5-stage system",
      "Direct video feedback on every submission",
      "Founding member pricing, locked in for life",
    ],
    featured: true,
    checkoutUrl: "https://buy.stripe.com/14AfZh4kW7Ko3qGg5Q0Jq00",
  },
]

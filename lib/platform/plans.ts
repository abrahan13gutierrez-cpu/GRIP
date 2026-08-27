export type Plan = {
  id: string
  name: string
  price: string
  cadence: string
  billed: string
  save: string | null
  features: string[]
  featured: boolean
  // TODO: replace these placeholder links with the live checkout URLs.
  checkoutUrl: string
}

export const PLANS: Plan[] = [
  {
    id: "cadet",
    name: "CADET",
    price: "$49.99",
    cadence: "/month",
    billed: "Billed monthly",
    save: null,
    features: ["All GRIP campuses", "Daily live broadcast"],
    featured: false,
    checkoutUrl: "https://checkout.example.com/grip-cadet", // PLACEHOLDER
  },
  {
    id: "heros-year",
    name: "HERO'S YEAR",
    price: "$39.99",
    cadence: "/month",
    billed: "Billed yearly",
    save: "Save $120.00 vs monthly",
    features: [
      "All of Cadet",
      "Daily coin bonus",
      "Power level boost",
      "Campus graduation certificate",
      "Access to job portal hiring opportunities",
    ],
    featured: true,
    checkoutUrl: "https://checkout.example.com/grip-heros-year", // PLACEHOLDER
  },
  {
    id: "champion",
    name: "CHAMPION",
    price: "$34.99",
    cadence: "/month",
    billed: "Billed every 2 years",
    save: "Save $360.00 vs monthly",
    features: [
      "Everything in Hero's Year",
      "Max coin bonus",
      "Instant DM access",
      "Shorter slow mode",
      "VIP support",
    ],
    featured: false,
    checkoutUrl: "https://checkout.example.com/grip-champion", // PLACEHOLDER
  },
]

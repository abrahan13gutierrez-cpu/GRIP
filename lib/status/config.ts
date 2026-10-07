// Single source of truth for the status engine. Add ranks, badges, XP rules or
// chat channels here; the UI and API read everything from these arrays.

export type RankShape = "plate" | "diamond" | "shield" | "star" | "crown"

export type Rank = {
  id: string
  label: string
  minXp: number
  color: string
  shape: RankShape
}

export const RANKS: Rank[] = [
  { id: "rookie", label: "Rookie", minXp: 0, color: "#9AA4B8", shape: "plate" },
  { id: "prospect", label: "Prospect", minXp: 150, color: "#5BC0EB", shape: "diamond" },
  { id: "pro", label: "Pro", minXp: 500, color: "#4ADE80", shape: "shield" },
  { id: "all-star", label: "All-Star", minXp: 1200, color: "#E8C468", shape: "star" },
  { id: "legend", label: "Legend", minXp: 3000, color: "#F87171", shape: "crown" },
]

export function rankForXp(xp: number): Rank {
  let current = RANKS[0]
  for (const r of RANKS) if (xp >= r.minXp) current = r
  return current
}

export function rankProgress(xp: number) {
  const rank = rankForXp(xp)
  const idx = RANKS.indexOf(rank)
  const next = RANKS[idx + 1] ?? null
  const pct = next ? Math.min(100, Math.round(((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)) : 100
  return { rank, next, pct, toNext: next ? next.minXp - xp : 0 }
}

export type XpReason = "daily_puzzle" | "lesson_complete" | "reaction_received"

export const XP_RULES: Record<XpReason, number> = {
  daily_puzzle: 25,
  lesson_complete: 15,
  reaction_received: 5,
}

export type BadgeIcon = "flame" | "graduation" | "trophy" | "message"

export type BadgeRule =
  | { type: "streak"; days: number }
  | { type: "courses_completed"; count: number }
  | { type: "weekly_top" }
  | { type: "messages_30d"; count: number }

export type Badge = {
  id: string
  label: string
  description: string
  icon: BadgeIcon
  color: string
  rule: BadgeRule
  // Weekly badges move between members, so they are not stored permanently.
  persistent: boolean
}

export const BADGES: Badge[] = [
  { id: "streak-100", label: "100-Day Streak", description: "100 Daily Puzzles in a row", icon: "flame", color: "#F87171", rule: { type: "streak", days: 100 }, persistent: true },
  { id: "streak-30", label: "30-Day Streak", description: "30 Daily Puzzles in a row", icon: "flame", color: "#E8C468", rule: { type: "streak", days: 30 }, persistent: true },
  { id: "streak-7", label: "7-Day Streak", description: "7 Daily Puzzles in a row", icon: "flame", color: "#F59E0B", rule: { type: "streak", days: 7 }, persistent: true },
  { id: "catcher-of-week", label: "Catcher of the Week", description: "Most XP earned in the last 7 days", icon: "trophy", color: "#E8C468", rule: { type: "weekly_top" }, persistent: false },
  { id: "first-course", label: "First Course", description: "Completed a full course", icon: "graduation", color: "#5BC0EB", rule: { type: "courses_completed", count: 1 }, persistent: true },
  { id: "contributor", label: "Active Contributor", description: "25+ messages in the last 30 days", icon: "message", color: "#4ADE80", rule: { type: "messages_30d", count: 25 }, persistent: true },
]

export type MemberStats = {
  streak: number
  coursesCompleted: number
  messages30d: number
  isWeeklyTop: boolean
}

export function earnedBadgeIds(stats: MemberStats): string[] {
  return BADGES.filter(({ rule }) => {
    switch (rule.type) {
      case "streak":
        return stats.streak >= rule.days
      case "courses_completed":
        return stats.coursesCompleted >= rule.count
      case "weekly_top":
        return stats.isWeeklyTop
      case "messages_30d":
        return stats.messages30d >= rule.count
    }
  }).map((b) => b.id)
}

export function sortBadgeIds(ids: string[]) {
  const order = new Map(BADGES.map((b, i) => [b.id, i]))
  return [...new Set(ids)].filter((id) => order.has(id)).sort((a, b) => order.get(a)! - order.get(b)!)
}

export const STATUS_OPTIONS = ["Online", "Training", "Away"] as const
export type StatusText = (typeof STATUS_OPTIONS)[number]

export const ONLINE_WINDOW_MS = 3 * 60 * 1000

// Which channels the chat shows, grouped in this order. Channels in the DB
// that are not listed here stay untouched but hidden.
export const CHAT_CATEGORIES: { label: string; slugs: string[] }[] = [
  { label: "INFORMATION", slugs: ["announcements"] },
  { label: "DAILY", slugs: ["daily-lesson", "daily-schedule", "daily-accountability"] },
  { label: "WORK", slugs: ["get-feedback"] },
  { label: "LEADERBOARD", slugs: ["leaderboard", "wins"] },
  { label: "COMMUNITY", slugs: ["grip-chat"] },
]

export const MOTD_CHANNEL_SLUG = "daily-lesson"

export const QUICK_REACTIONS = ["🔥", "💪", "🧠", "👑"]

export const EMOJI_PICKER = [
  "🔥", "💪", "🧠", "👑", "⚾", "🧤", "🎯", "⚡",
  "👏", "🙌", "👍", "👀", "💯", "🏆", "🥇", "✅",
  "😂", "😤", "😎", "🤝", "❤️", "🚀", "📈", "🙏",
]

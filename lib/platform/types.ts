export type Channel = {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  is_broadcast: boolean
  sort_order: number
}

export type PinnedResource = {
  id: string
  channel_id: string
  title: string
  description: string | null
  url: string | null
  sort_order: number
}

export type ReactionSummary = {
  emoji: string
  count: number
  reactedByMe: boolean
}

export type ChatMessage = {
  id: string
  channel_id: string
  user_id: string
  content: string
  created_at: string
  username: string
  reactions: ReactionSummary[]
}

export const REACTION_EMOJIS = ["🔥", "💪", "👏", "⚾", "🎯"] as const

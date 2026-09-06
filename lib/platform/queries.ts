import { createClient } from "@/lib/supabase/server"
import type { Channel, ChatMessage, PinnedResource, ReactionSummary } from "./types"

export async function getChannels(): Promise<Channel[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("channels")
    .select("id, slug, name, description, category, is_broadcast, sort_order")
    .order("sort_order", { ascending: true })

  if (error) {
    console.log("[v0] getChannels error:", error.message)
    return []
  }
  return (data ?? []) as Channel[]
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("channels")
    .select("id, slug, name, description, category, is_broadcast, sort_order")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.log("[v0] getChannelBySlug error:", error.message)
    return null
  }
  return data as Channel | null
}

export async function getPinnedResources(channelId: string): Promise<PinnedResource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pinned_resources")
    .select("id, channel_id, title, description, url, sort_order")
    .eq("channel_id", channelId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.log("[v0] getPinnedResources error:", error.message)
    return []
  }
  return (data ?? []) as PinnedResource[]
}

export async function getMessages(channelId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rows, error } = await supabase
    .from("messages")
    .select("id, channel_id, user_id, content, created_at, profiles!inner(username)")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(100)

  if (error) {
    console.log("[v0] getMessages error:", error.message)
    return []
  }

  const messageIds = (rows ?? []).map((r) => r.id)
  const reactionMap = new Map<string, ReactionSummary[]>()

  if (messageIds.length > 0) {
    const { data: reactionRows } = await supabase
      .from("reactions")
      .select("message_id, emoji, user_id")
      .in("message_id", messageIds)

    for (const r of reactionRows ?? []) {
      const list = reactionMap.get(r.message_id) ?? []
      const existing = list.find((x) => x.emoji === r.emoji)
      if (existing) {
        existing.count += 1
        if (r.user_id === user?.id) existing.reactedByMe = true
      } else {
        list.push({ emoji: r.emoji, count: 1, reactedByMe: r.user_id === user?.id })
      }
      reactionMap.set(r.message_id, list)
    }
  }

  return (rows ?? []).map((r) => {
    // profiles may come back as an object or a single-element array depending on the join
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      channel_id: r.channel_id,
      user_id: r.user_id,
      content: r.content,
      created_at: r.created_at,
      username: profile?.username ?? "member",
      reactions: reactionMap.get(r.id) ?? [],
    }
  })
}

export async function getCurrentUsername(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "member"
  const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
  return data?.username ?? user.email?.split("@")[0] ?? "member"
}

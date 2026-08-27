"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function sendMessage(formData: FormData) {
  const channelId = String(formData.get("channelId") ?? "")
  const slug = String(formData.get("slug") ?? "")
  const content = String(formData.get("content") ?? "").trim()

  if (!channelId || !content) return { error: "Message cannot be empty." }
  if (content.length > 2000) return { error: "Message is too long." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in." }

  const { error } = await supabase.from("messages").insert({
    channel_id: channelId,
    user_id: user.id,
    content,
  })

  if (error) {
    console.log("[v0] sendMessage error:", error.message)
    return { error: "Could not send message." }
  }

  revalidatePath(`/channels/${slug}`)
  return { ok: true }
}

export async function toggleReaction(formData: FormData) {
  const messageId = String(formData.get("messageId") ?? "")
  const emoji = String(formData.get("emoji") ?? "")
  const slug = String(formData.get("slug") ?? "")

  if (!messageId || !emoji) return { error: "Invalid reaction." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in." }

  // Toggle: remove if it exists, otherwise add.
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle()

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id)
  } else {
    const { error } = await supabase.from("reactions").insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    })
    if (error) {
      console.log("[v0] toggleReaction error:", error.message)
      return { error: "Could not react." }
    }
  }

  revalidatePath(`/channels/${slug}`)
  return { ok: true }
}

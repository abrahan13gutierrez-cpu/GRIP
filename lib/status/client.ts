"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { StatusText } from "@/lib/status/config"

// Inside the preview iframe the session cookie does not always reach the
// server, so status routes also accept the browser session as a bearer token.
export async function authedFetch(url: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  const token = data.session?.access_token
  const headers = new Headers(init.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  return fetch(url, { ...init, headers })
}

const authedFetcher = (url: string) => authedFetch(url).then((r) => r.json())

export type StatusMember = {
  id: string
  name: string
  handle: string | null
  avatar_url: string | null
  initials: string
  online: boolean
  status: StatusText | "Offline"
  xp: number
  rankId: string
  streak: number
  badges: string[]
}

export type StatusMe = {
  id: string
  xp: number
  streak: number
  badges: string[]
  locale: "en" | "es"
  status_text: StatusText | null
  puzzleDoneToday: boolean
}

export type StatusResponse = { members: StatusMember[]; me: StatusMe | null }

export function useStatus() {
  return useSWR<StatusResponse>("/api/status", authedFetcher, { refreshInterval: 30000 })
}

export type UnreadResponse = {
  channels: Record<string, { unread: number; mentions: number }>
  total: number
  mentions: number
  sections: Partial<Record<string, number>>
}

export function useUnread() {
  return useSWR<UnreadResponse>("/api/status/unread", authedFetcher, { refreshInterval: 30000 })
}

export async function awardXp(reason: string, sourceId: string) {
  try {
    await authedFetch("/api/status/xp", { method: "POST", body: JSON.stringify({ reason, sourceId }) })
  } catch (err) {
    console.log("[v0] awardXp error:", err)
  }
}

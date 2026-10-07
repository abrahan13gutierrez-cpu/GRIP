import { NextResponse } from "next/server"
import { getRequestUser, utcDay } from "@/lib/status/server"
import {
  BADGES,
  ONLINE_WINDOW_MS,
  STATUS_OPTIONS,
  earnedBadgeIds,
  rankForXp,
  sortBadgeIds,
  type StatusText,
} from "@/lib/status/config"

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  const raw = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return raw.toUpperCase()
}

export async function GET(request: Request) {
  const { user, admin } = await getRequestUser(request)

  const since30d = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const since10m = new Date(Date.now() - 10 * 60_000).toISOString()

  const [profilesRes, statusRes, badgesRes, coursesRes, msgs30Res, recentRes] = await Promise.all([
    admin
      .from("profiles")
      .select("id, username, display_name, full_name, avatar_url, last_seen_at, status_text, locale")
      .limit(500),
    admin.rpc("member_status"),
    admin.from("user_badges").select("user_id, badge_id"),
    admin.from("course_progress").select("user_id").gte("progress", 100),
    admin.from("messages").select("user_id").gte("created_at", since30d).limit(10000),
    admin.from("messages").select("user_id").gte("created_at", since10m),
  ])

  if (profilesRes.error) {
    console.log("[v0] GET /api/status profiles error:", profilesRes.error.message)
    return NextResponse.json({ members: [], me: null })
  }
  if (statusRes.error) console.log("[v0] GET /api/status member_status error:", statusRes.error.message)

  const statusById = new Map<string, { xp: number; week_xp: number; streak: number }>()
  for (const s of (statusRes.data ?? []) as { user_id: string; xp: number; week_xp: number; streak: number }[]) {
    statusById.set(s.user_id, { xp: Number(s.xp) || 0, week_xp: Number(s.week_xp) || 0, streak: s.streak || 0 })
  }

  let weeklyTopId: string | null = null
  let weeklyTopXp = 0
  for (const [id, s] of statusById) {
    if (s.week_xp > weeklyTopXp) {
      weeklyTopXp = s.week_xp
      weeklyTopId = id
    }
  }

  const storedBadges = new Map<string, Set<string>>()
  for (const b of badgesRes.data ?? []) {
    const set = storedBadges.get(b.user_id) ?? new Set()
    set.add(b.badge_id)
    storedBadges.set(b.user_id, set)
  }

  const coursesDone = new Map<string, number>()
  for (const c of coursesRes.data ?? []) coursesDone.set(c.user_id, (coursesDone.get(c.user_id) ?? 0) + 1)

  const msgCount = new Map<string, number>()
  for (const m of msgs30Res.data ?? []) msgCount.set(m.user_id, (msgCount.get(m.user_id) ?? 0) + 1)

  const recentPosters = new Set((recentRes.data ?? []).map((m) => m.user_id))
  const now = Date.now()
  const persistentIds = new Set(BADGES.filter((b) => b.persistent).map((b) => b.id))
  const newBadgeRows: { user_id: string; badge_id: string }[] = []

  const members = (profilesRes.data ?? []).map((p) => {
    const name = p.display_name || p.full_name || p.username || "member"
    const s = statusById.get(p.id) ?? { xp: 0, week_xp: 0, streak: 0 }
    const earned = earnedBadgeIds({
      streak: s.streak,
      coursesCompleted: coursesDone.get(p.id) ?? 0,
      messages30d: msgCount.get(p.id) ?? 0,
      isWeeklyTop: weeklyTopId === p.id,
    })
    const stored = storedBadges.get(p.id) ?? new Set<string>()
    for (const id of earned) {
      if (persistentIds.has(id) && !stored.has(id)) newBadgeRows.push({ user_id: p.id, badge_id: id })
    }
    const lastSeen = p.last_seen_at ? new Date(p.last_seen_at).getTime() : 0
    const online = now - lastSeen < ONLINE_WINDOW_MS || recentPosters.has(p.id)
    const statusText = (p.status_text as StatusText | null) ?? "Online"
    return {
      id: p.id,
      name,
      handle: p.username ?? null,
      avatar_url: p.avatar_url ?? null,
      initials: initialsFrom(name),
      online,
      status: online ? statusText : ("Offline" as const),
      xp: s.xp,
      rankId: rankForXp(s.xp).id,
      streak: s.streak,
      badges: sortBadgeIds([...stored, ...earned]),
      _locale: p.locale,
      _statusText: p.status_text,
    }
  })

  if (newBadgeRows.length) {
    const { error } = await admin
      .from("user_badges")
      .upsert(newBadgeRows, { onConflict: "user_id,badge_id", ignoreDuplicates: true })
    if (error) console.log("[v0] persist badges error:", error.message)
  }

  let me = null
  if (user) {
    const mine = members.find((m) => m.id === user.id)
    const { data: puzzle } = await admin
      .from("user_xp")
      .select("id")
      .eq("user_id", user.id)
      .eq("reason", "daily_puzzle")
      .eq("source_id", utcDay())
      .maybeSingle()
    me = {
      id: user.id,
      xp: mine?.xp ?? 0,
      streak: mine?.streak ?? 0,
      badges: mine?.badges ?? [],
      locale: mine?._locale === "es" ? "es" : "en",
      status_text: mine?._statusText ?? null,
      puzzleDoneToday: Boolean(puzzle),
    }
  }

  return NextResponse.json({
    members: members.map(({ _locale, _statusText, ...m }) => m),
    me,
  })
}

export async function PATCH(request: Request) {
  const { user, admin } = await getRequestUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const update: Record<string, string> = {}
  if (body?.locale !== undefined) {
    if (body.locale !== "en" && body.locale !== "es") {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
    }
    update.locale = body.locale
  }
  if (body?.status_text !== undefined) {
    if (!STATUS_OPTIONS.includes(body.status_text)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    update.status_text = body.status_text
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

  const { error } = await admin.from("profiles").update(update).eq("id", user.id)
  if (error) {
    console.log("[v0] PATCH /api/status error:", error.message)
    return NextResponse.json({ error: "Could not update" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

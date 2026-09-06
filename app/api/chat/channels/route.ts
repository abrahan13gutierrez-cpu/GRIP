import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ channels: [] }, { status: 401 })

  const { data, error } = await supabase
    .from("channels")
    .select("id, slug, name, description, category, is_broadcast, sort_order")
    .order("sort_order", { ascending: true })

  if (error) {
    console.log("[v0] GET /api/chat/channels error:", error.message)
    return NextResponse.json({ channels: [] })
  }
  return NextResponse.json({ channels: data ?? [] })
}

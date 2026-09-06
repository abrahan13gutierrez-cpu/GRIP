import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Returns a map of { [ref_id]: playback_id } for lesson videos (e.g. drills → Mux).
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("videos")
    .select("ref_id, playback_id")
    .eq("kind", "lesson")
    .not("playback_id", "is", null)

  if (error) {
    console.log("[v0] GET /api/videos error:", error.message)
    return NextResponse.json({ videos: {} })
  }

  const videos: Record<string, string> = {}
  for (const row of data ?? []) {
    if (row.ref_id && row.playback_id) videos[row.ref_id] = row.playback_id
  }
  return NextResponse.json({ videos })
}

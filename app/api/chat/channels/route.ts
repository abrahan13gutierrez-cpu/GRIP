import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// La lista de canales es estructura compartida (no datos privados por usuario).
// La leemos con la service-role key en el servidor para que el sidebar siempre
// muestre los canales, sin depender de la sesión —que dentro del iframe del
// preview cross-site no siempre llega al servidor y dejaba la lista vacía.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.log("[v0] GET /api/chat/channels missing Supabase env")
    return NextResponse.json({ channels: [] })
  }

  const admin = createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await admin
    .from("channels")
    .select("id, slug, name, description, category, emoji, is_broadcast, sort_order")
    .order("sort_order", { ascending: true })

  if (error) {
    console.log("[v0] GET /api/chat/channels error:", error.message)
    return NextResponse.json({ channels: [] })
  }
  return NextResponse.json({ channels: data ?? [] })
}

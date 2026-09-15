import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { COURSES } from "@/lib/dashboard/data"

// Drills con video real (espejo de misiones-library). Búsqueda de la Bóveda.
const DRILLS = [
  "Blocking Aqua Bag",
  "Blocking w/ Stick",
  "Blocking Regular Glove",
  "Resistance Band - Back",
  "Assistance Resistance - Front",
  "CB Boz - Wrist Band",
]

// Búsqueda global del dashboard: Cursos, Misiones (drills), Canales y Personas.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim().toLowerCase()
  if (!q) return NextResponse.json({ groups: [] })

  const courses = COURSES.filter(
    (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
  ).map((c) => ({ id: c.id, title: c.title, subtitle: `${c.lessons} lecciones` }))

  const drills = DRILLS.filter((d) => d.toLowerCase().includes(q)).map((d, i) => ({
    id: String(i),
    title: d,
    subtitle: "Drill",
  }))

  let channels: any[] = []
  let people: any[] = []
  const admin = createAdminClient()
  if (admin) {
    const [chRes, peRes] = await Promise.all([
      admin.from("channels").select("id, name, slug, emoji").ilike("name", `%${q}%`).limit(8),
      admin
        .from("profiles")
        .select("id, username, display_name, full_name, avatar_url")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(8),
    ])
    channels = (chRes.data ?? []).map((c: any) => ({
      id: c.id,
      title: c.name,
      subtitle: "Canal",
      emoji: c.emoji,
    }))
    people = (peRes.data ?? []).map((p: any) => ({
      id: p.id,
      title: p.display_name || p.full_name || p.username || "member",
      subtitle: "Persona",
      avatarUrl: p.avatar_url,
    }))
  }

  const groups = [
    { type: "Cursos", items: courses },
    { type: "Misiones", items: drills },
    { type: "Canales", items: channels },
    { type: "Personas", items: people },
  ].filter((g) => g.items.length > 0)

  return NextResponse.json({ groups })
}

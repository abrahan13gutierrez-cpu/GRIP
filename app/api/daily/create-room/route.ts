import { type NextRequest, NextResponse } from "next/server"

/**
 * Crea una sala temporal en Daily.co.
 * POST { topic?: string, expiresInMinutes?: number } -> { url, name }
 *
 * Requiere la variable de entorno DAILY_API_KEY (configúrala en Vercel).
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "DAILY_API_KEY no está configurada en el servidor." },
      { status: 500 },
    )
  }

  let topic = "grip-live"
  let expiresInMinutes = 60
  try {
    const body = await req.json()
    if (typeof body?.topic === "string" && body.topic.trim()) {
      // Daily room names: solo alfanuméricos, guiones y guiones bajos.
      topic = body.topic.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 40)
    }
    if (Number.isFinite(body?.expiresInMinutes)) {
      // Limita entre 5 y 240 minutos para evitar valores absurdos.
      expiresInMinutes = Math.min(240, Math.max(5, Math.floor(body.expiresInMinutes)))
    }
  } catch {
    // Sin body válido: usamos los defaults.
  }

  const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60

  try {
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        privacy: "public",
        properties: {
          exp,
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.log("[v0] Daily create-room error:", res.status, detail)
      return NextResponse.json(
        { error: "No se pudo crear la sala en Daily." },
        { status: 502 },
      )
    }

    const room = (await res.json()) as { url: string; name: string }
    return NextResponse.json({ url: room.url, name: room.name })
  } catch (err) {
    console.log("[v0] Daily create-room exception:", err)
    return NextResponse.json({ error: "Fallo de red al contactar Daily." }, { status: 502 })
  }
}

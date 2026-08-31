import { NextResponse } from "next/server"
import { mux } from "@/lib/mux/server"

/**
 * POST /api/mux/upload-url
 * Creates a Mux Direct Upload and returns the signed upload URL + upload id.
 * Used by CATCHERS uploading a feedback/attempt clip, and by COACHES
 * uploading a lesson video.
 *
 * Optional JSON body: { kind?: "lesson" | "feedback", refId?: string }
 * These are stored as passthrough metadata so the webhook can later
 * associate the finished asset with the right DB record.
 */
export async function POST(request: Request) {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    return NextResponse.json(
      { error: "Mux is not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET." },
      { status: 500 },
    )
  }

  let kind: string | undefined
  let refId: string | undefined
  try {
    const body = await request.json()
    kind = body?.kind
    refId = body?.refId
  } catch {
    // no body is fine
  }

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: request.headers.get("origin") ?? "*",
      new_asset_settings: {
        playback_policy: ["public"],
        // passthrough travels with the asset and comes back on the webhook
        passthrough: JSON.stringify({ kind: kind ?? "feedback", refId: refId ?? null }),
      },
    })

    return NextResponse.json({ url: upload.url, id: upload.id })
  } catch (err) {
    console.log("[v0] Mux upload-url error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Could not create upload URL." }, { status: 500 })
  }
}

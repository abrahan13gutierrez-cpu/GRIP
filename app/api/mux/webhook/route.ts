import { NextResponse } from "next/server"
import { mux } from "@/lib/mux/server"

/**
 * POST /api/mux/webhook
 * Receives Mux webhooks. We care about:
 *   - video.upload.asset_created  -> links an upload id to its new asset id
 *   - video.asset.ready           -> asset finished processing, playback_id available
 *
 * If MUX_WEBHOOK_SIGNING_SECRET is set we verify the signature (recommended).
 * Otherwise we parse the payload directly (fine for local/preview testing).
 */
export async function POST(request: Request) {
  const rawBody = await request.text()
  const secret = process.env.MUX_WEBHOOK_SIGNING_SECRET

  let event: { type?: string; data?: Record<string, unknown> }

  try {
    if (secret) {
      const headers = Object.fromEntries(request.headers.entries())
      event = (await mux.webhooks.unwrap(rawBody, headers, secret)) as typeof event
    } else {
      event = JSON.parse(rawBody)
    }
  } catch (err) {
    console.log("[v0] Mux webhook verify/parse failed:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
  }

  const data = event.data ?? {}

  switch (event.type) {
    case "video.upload.asset_created": {
      const uploadId = (data as { id?: string }).id
      const assetId = (data as { asset_id?: string }).asset_id
      console.log("[v0] Mux upload.asset_created:", { uploadId, assetId })
      // TODO(db): find the record created with this upload id and store assetId.
      //   await db.videos.update({ where: { uploadId }, data: { assetId } })
      break
    }

    case "video.asset.ready": {
      const assetId = (data as { id?: string }).id
      const playbackIds = (data as { playback_ids?: { id: string; policy: string }[] }).playback_ids
      const playbackId = playbackIds?.[0]?.id
      // passthrough was set at upload time: { kind, refId }
      let passthrough: { kind?: string; refId?: string | null } = {}
      try {
        passthrough = JSON.parse((data as { passthrough?: string }).passthrough ?? "{}")
      } catch {
        // ignore malformed passthrough
      }
      console.log("[v0] Mux asset.ready:", { assetId, playbackId, passthrough })
      // TODO(db): persist the playback id so the UI can render the finished video.
      //   await db.videos.update({
      //     where: { assetId },              // or match on passthrough.refId
      //     data: { playbackId, status: "ready" },
      //   })
      break
    }

    default:
      // Other events (video.asset.errored, etc.) can be handled here later.
      break
  }

  // Always 200 quickly so Mux doesn't retry.
  return NextResponse.json({ received: true })
}

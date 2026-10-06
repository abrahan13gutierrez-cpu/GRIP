"use client"

import MuxPlayer from "@mux/mux-player-react"

type MuxVideoPlayerProps = {
  playbackId: string
  title?: string
  /** poster override; Mux auto-generates one from the playbackId otherwise */
  poster?: string
  accentColor?: string
  className?: string
  /** Fires when playback reaches the end (used to auto-complete lesson steps). */
  onEnded?: () => void
}

/**
 * Reusable on-demand player styled to match GRIP's dark theme:
 * rounded corners, amber accent, no browser-native chrome.
 */
export function MuxVideoPlayer({
  playbackId,
  title,
  poster,
  accentColor = "#ffb020",
  className = "",
  onEnded,
  variant = "framed",
}: MuxVideoPlayerProps & { variant?: "framed" | "bleed" }) {
  const frame = variant === "bleed" ? "bg-black" : "overflow-hidden rounded-lg border border-[#262b33] bg-black"
  return (
    <div className={`${frame} ${className}`}>
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        metadata={title ? { video_title: title } : undefined}
        poster={poster}
        accentColor={accentColor}
        onEnded={onEnded}
        style={
          {
            aspectRatio: "16 / 9",
            width: "100%",
            // Llena el recuadro 16:9 recortando sobrantes en vez de dejar franjas negras (pillarboxing).
            "--media-object-fit": "cover",
            "--media-object-position": "center",
            "--controls-backdrop-color": "rgba(10,12,15,0.6)",
          } as React.CSSProperties
        }
      />
    </div>
  )
}

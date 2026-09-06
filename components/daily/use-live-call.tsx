"use client"

import { useCallback, useState } from "react"

/**
 * Flujo compartido de llamada en vivo:
 * - startCall(topic): POST a /api/daily/create-room y guarda la room URL.
 * - openRoom(url): abre directamente una URL de sala ya conocida (canales LIVE).
 * - roomUrl / closeCall: estado para renderizar <LiveCallModal />.
 */
export function useLiveCall() {
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCall = useCallback(async (topic: string, expiresInMinutes = 60) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/daily/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, expiresInMinutes }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "No se pudo crear la sala.")
      }
      const data = (await res.json()) as { url: string }
      setRoomUrl(data.url)
    } catch (err) {
      console.log("[v0] startCall error:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar la llamada.")
    } finally {
      setLoading(false)
    }
  }, [])

  const openRoom = useCallback((url: string) => {
    setError(null)
    setRoomUrl(url)
  }, [])

  const closeCall = useCallback(() => setRoomUrl(null), [])

  return { roomUrl, loading, error, startCall, openRoom, closeCall }
}

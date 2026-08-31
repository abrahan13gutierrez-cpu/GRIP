"use client"

import { useEffect, useRef, useState } from "react"
import DailyIframe, { type DailyCall } from "@daily-co/daily-js"
import { X } from "lucide-react"

/**
 * Modal de llamada en vivo con Daily.co.
 * Embebe el iframe de Daily a pantalla completa dentro de un modal con tema oscuro.
 * Al cerrar, destruye el frame (callObject.destroy()) para liberar cámara/micrófono.
 */
export function LiveCallModal({
  roomUrl,
  onClose,
}: {
  roomUrl: string
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const callRef = useRef<DailyCall | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Evita crear dos instancias (StrictMode monta el efecto dos veces en dev).
    if (callRef.current || DailyIframe.getCallInstance()) {
      const existing = DailyIframe.getCallInstance()
      if (existing) {
        existing.destroy()
      }
    }

    const frame = DailyIframe.createFrame(container, {
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "0",
        background: "#0a0c0f",
      },
    })
    callRef.current = frame

    frame.on("left-meeting", () => {
      onClose()
    })

    frame.join({ url: roomUrl }).catch((err: unknown) => {
      console.log("[v0] Daily join error:", err)
      setError("No se pudo unir a la llamada.")
    })

    return () => {
      // Limpieza: destruir el frame para no dejar cámara/micrófono activos.
      callRef.current?.destroy()
      callRef.current = null
    }
  }, [roomUrl, onClose])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-sm">
      {/* Barra superior del modal */}
      <div className="flex items-center justify-between border-b border-[#262b33] bg-[#0d1322] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#ef4444]" />
          <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wide text-[#eef1f5]">
            Llamada en vivo
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar llamada"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262b33] text-[#8a919c] transition-colors hover:border-[#ef4444] hover:text-[#ef4444]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Área del iframe de Daily */}
      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#ef4444]">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

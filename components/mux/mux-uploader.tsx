"use client"

import { useRef, useState } from "react"
import * as UpChunk from "@mux/upchunk"
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

type MuxUploaderProps = {
  /** Fires when Mux finishes ingesting the file. Returns the upload id. */
  onUploadComplete?: (uploadId: string) => void
  /** "feedback" (catcher clip) or "lesson" (coach video) — stored as passthrough */
  kind?: "feedback" | "lesson"
  refId?: string
  label?: string
}

type Status = "idle" | "uploading" | "processing" | "done" | "error"

/**
 * Lets a user pick a video and streams it straight to Mux with UpChunk,
 * showing an amber progress bar in the app's visual style.
 */
export function MuxUploader({
  onUploadComplete,
  kind = "feedback",
  refId,
  label = "Subir mi video",
}: MuxUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setStatus("uploading")
    setProgress(0)
    setError(null)

    try {
      const res = await fetch("/api/mux/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, refId }),
      })
      if (!res.ok) throw new Error("No se pudo obtener la URL de subida")
      const { url, id } = await res.json()

      const upload = UpChunk.createUpload({ endpoint: url, file, chunkSize: 5120 })

      upload.on("progress", (e) => setProgress(Math.round(e.detail as number)))
      upload.on("error", (e) => {
        console.log("[v0] UpChunk error:", (e.detail as { message?: string })?.message)
        setStatus("error")
        setError("Falló la subida. Intenta de nuevo.")
      })
      upload.on("success", () => {
        setStatus("processing")
        // Mux still needs a few seconds to encode; the webhook delivers the playbackId.
        setTimeout(() => {
          setStatus("done")
          onUploadComplete?.(id)
        }, 1200)
      })
    } catch (err) {
      console.log("[v0] upload start error:", err instanceof Error ? err.message : err)
      setStatus("error")
      setError("No se pudo iniciar la subida.")
    }
  }

  const reset = () => {
    setStatus("idle")
    setProgress(0)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {status === "idle" && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ffb020] px-4 py-2.5 text-sm font-semibold text-[#0a0c0f] transition hover:bg-[#ffbf40]"
        >
          <Upload className="h-4 w-4" />
          {label}
        </button>
      )}

      {(status === "uploading" || status === "processing") && (
        <div className="rounded-lg border border-[#262b33] bg-[#12151a] p-3">
          <div className="mb-2 flex items-center gap-2 text-[12px] text-[#8a919c]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffb020]" />
            {status === "uploading" ? `Subiendo… ${progress}%` : "Procesando video…"}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#262b33]">
            <div
              className="h-full rounded-full bg-[#ffb020] transition-all duration-200"
              style={{ width: `${status === "processing" ? 100 : progress}%` }}
            />
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center justify-between rounded-lg border border-[#16512e] bg-[#2fbf71]/[.08] px-3 py-2.5 text-[13px] text-[#2fbf71]">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Subida completa
          </span>
          <button onClick={reset} className="text-[11px] text-[#8a919c] hover:text-[#eef1f5]">
            Subir otro
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-between rounded-lg border border-[#5c2626] bg-[#ef4444]/[.08] px-3 py-2.5 text-[13px] text-[#ff6b6b]">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button onClick={reset} className="text-[11px] text-[#8a919c] hover:text-[#eef1f5]">
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

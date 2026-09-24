'use client'

import { useEffect, useRef } from 'react'

/**
 * Lightweight canvas "code rain". Amber-tinted to match GRIP rather than the
 * classic green, drawn with a trailing fade so glyphs streak downward.
 */
export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chars =
      'アカサタナハマヤラワ0123456789GRIPカタ<>[]{}=+*・ﾊﾐﾋｰ'.split('')
    const fontSize = 15
    let width = 0
    let height = 0
    let columns = 0
    let drops: number[] = []
    let raf = 0
    let last = 0

    function resize() {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      columns = Math.max(1, Math.floor(width / fontSize))
      drops = Array.from({ length: columns }, () => Math.random() * -50)
    }

    function draw(now: number) {
      raf = requestAnimationFrame(draw)
      if (now - last < 55) return
      last = now

      // Translucent wash creates the fading trails.
      ctx.fillStyle = 'rgba(15,15,18,0.14)'
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        // Bright leading glyph, dimmer amber body.
        ctx.fillStyle =
          Math.random() > 0.92
            ? 'rgba(245,222,140,0.95)'
            : 'rgba(224,189,74,0.55)'
        ctx.fillText(text, x, y)
        if (y > height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}

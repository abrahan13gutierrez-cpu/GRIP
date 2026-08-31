"use client"

import { useEffect } from "react"

/**
 * The "ResizeObserver loop completed with undelivered notifications" message is a
 * benign browser notification (commonly emitted by libraries that observe layout,
 * such as the Mux player and Daily). It does not indicate a real bug, but Next.js's
 * dev error overlay surfaces it as an error. This component stops that specific
 * message from bubbling up to the overlay / console without hiding real errors.
 */
export function SuppressResizeObserverError() {
  useEffect(() => {
    const RESIZE_OBSERVER_MSG = "ResizeObserver loop completed with undelivered notifications"

    const onError = (event: ErrorEvent) => {
      if (event.message && event.message.includes(RESIZE_OBSERVER_MSG)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener("error", onError)
    return () => window.removeEventListener("error", onError)
  }, [])

  return null
}

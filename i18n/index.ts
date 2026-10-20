"use client"

import { useCallback } from "react"
import { en, type MessageKey } from "./en"
import { es } from "./es"
import { useStatus } from "@/lib/status/client"

export type Locale = "en" | "es"

const DICTS: Record<Locale, Partial<Record<MessageKey, string>>> = { en, es }

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>) {
  const raw = DICTS[locale][key] ?? en[key]
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
}

export function useT() {
  const { data } = useStatus()
  const locale: Locale = data?.me?.locale ?? "en"
  return useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  )
}

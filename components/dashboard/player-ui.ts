/**
 * GRIP — Tokens de diseño compartidos por las vistas de "Course Player"
 * (LessonPlayer para "Empieza aquí" y "Bóveda", y CursosProtocol para "GRIP Level Up").
 *
 * Centraliza tipografía, botones y jerarquía para que las tres vistas se vean
 * como una sola familia. Paleta GRIP: fondo #0a0c0f, paneles #12151a / #171b21,
 * línea #262b33, ámbar #ffb020 (progreso/activo), verde #2fbf71 (completado).
 */

export const OSWALD = "font-[family-name:var(--font-oswald)]"

// Encabezado de una vista de reproductor (título de sección).
export const playerHeading = `text-lg uppercase tracking-wide text-[#eef1f5] ${OSWALD}`

// Etiqueta pequeña sobre un título (nombre de módulo / sección).
export const playerKicker = "text-[11px] font-semibold uppercase tracking-wider text-[#4d545e]"

// Botón de acción primario (ámbar) — ej. "Siguiente lección", "Marcar aprobado".
export const playerBtnPrimary =
  "flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ffb020] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#0a0c0f] transition-colors hover:bg-[#ffbe45] disabled:cursor-not-allowed disabled:border disabled:border-[#262b33] disabled:bg-transparent disabled:text-[#4d545e] disabled:hover:bg-transparent"

// Botón de acción secundario (contorno).
export const playerBtnSecondary =
  "flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#262b33] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#eef1f5] transition-colors hover:border-[#3a424d] disabled:opacity-50"

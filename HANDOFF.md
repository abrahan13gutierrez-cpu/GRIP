# GRIP: traspaso a Claude Code (1 de octubre de 2026)

Este archivo resume el estado del proyecto y las decisiones tomadas hasta ahora. Se lee junto con `GRIP-SPEC.md`: el spec dice qué se construye, este archivo dice dónde vamos y qué se decidió después.

## Cómo trabajar con G

- G está aprendiendo a programar. Explicar en español sencillo y decir siempre qué se va a hacer antes de hacerlo.
- No decidir nada por cuenta propia: textos, nombres, diseño o cambios de base de datos se preguntan primero.
- No hacer commit sin que G revise los cambios.
- No tocar `main`. El trabajo va en la rama `cleanup-v1`.
- No tocar estos archivos salvo petición expresa: `app/page.tsx`, `components/platform/pricing-card.tsx`, todo lo que esté en `supabase/` y `next-env.d.ts`.
- No usar `git restore` ni descartar cambios sin que G lo pida.
- No borrar tablas ni datos de Supabase. No tocar la tabla `leads` (tiene nombres y correos reales).
- No correr `/init` ni sobrescribir `CLAUDE.md` ni `AGENTS.md`.
- Las claves de Supabase, Mux y Stripe solo viven en variables de entorno.
- "Compila" no es lo mismo que "funciona": decir exactamente qué se probó y qué no.

## Dónde estamos

- Rama de trabajo: `cleanup-v1`. Verificar con `git log --oneline -5`; debe haber un commit aparte con el trabajo de Stripe del 26 de septiembre (nunca se había guardado) y el commit del paso 1.
- **Paso 1, hecho y commiteado:** se borraron 13 archivos de código muerto (prototipo viejo de canales, formularios sin uso, `lib/supabase/proxy.ts`, etc.). `dashboard-sidebar.tsx` y `app/dashboard/page.tsx` quedaron mostrando solo Chat, Courses y Profile. El build pasa, pero no revisa tipos (ver "Problemas conocidos").
- **Paso 2:** una herramienta anterior se cortó por un error de cuota. Lo que alcanzó a hacer ya está commiteado en `c026744` (`lesson-player.tsx`, `profile-view.tsx` y `courses-view.tsx`; el tercer archivo era `courses-view.tsx`). No quedaron cambios sin commit.
- **Paso 2, continuación (2 de octubre):** `6e17f77` quitó el código muerto de llamada en vivo de `chat-view.tsx`, los restos sin uso de `profile-view.tsx` y comentarios viejos de `courses-view.tsx`. `fbaac05` oculta en Courses las tarjetas que no son drills (solo se ven Bóveda del conocimiento y Framing) y, dentro de cada curso, los módulos sin drills. No se borró código. En el perfil, G decidió dejar la bio, "Miembro desde", el botón de Ajustes y la insignia fija "Catcher".
- El correo de ejemplo (`TU-CORREO-DE-GITHUB`) está en 3 commits (`64eadf2`, `c026744`, `92e0d48`) y la rama ya está publicada en GitHub. No hacer `--amend`: solo corregir `git config --global user.email` para los commits que vienen.
- `next-env.d.ts` ya quedó commiteado en `c026744`. Lo genera Next.js y no hace daño.
- El commit `6a69ab9` ("launch: single Founders plan with live Stripe link") menciona un plan Founders con un enlace de Stripe live. Pendiente de confirmar con G.

## Qué es el paso 2

1. `lesson-player.tsx`: quitar los datos inventados. Son el encabezado "Ficha de prospecto", el "Grado general", las barras de habilidades fijas (Blocking 55, Framing 50, Pop Time 55) y el veredicto fijo de "Coach Reyes". Se queda el video, la lista de lecciones, el botón Next y el progreso del curso. Dejar de usar `toGrade()` y `gradeStatus()` en `lesson-player.tsx` y `courses-view.tsx`, pero no borrar `lib/dashboard/scouting.ts`.
2. `profile-view.tsx`: esconder las pestañas My Journey y Stats, la barra de nivel y los power points. El perfil de v1 muestra solo foto, username, selector de idioma (si ya existe) y cerrar sesión. No tocar `/api/profile`.
3. `chat-view.tsx`: quitar solo el botón de llamada en vivo y sus imports (`live-call-modal`, `use-live-call`). No borrar los archivos de `components/daily`. Nota: en el código no había botón; solo había código muerto (los imports, la llamada a `useLiveCall()` y el modal).
4. Listar cada tarjeta de la pantalla Courses y decir si su video es real o de relleno.

## Decisiones tomadas después del spec

- **Acceso abierto durante la prueba** (Etapa 1): sin bloqueo por pago. El bloqueo se construye antes de la Etapa 2.
- **Subir clips en #get-feedback (opción A):** el Playback ID de Mux se guarda en `messages.content` con el formato `[video:playback_id]`, sin cambiar el schema. El mensaje se inserta solo cuando el video de Mux ya se puede reproducir (webhook o consulta periódica), y mientras tanto el que sube ve "Processing your clip...". `chat-view.tsx` muestra `<MuxVideoPlayer />` cuando el contenido trae ese formato.
- **Navegación v1:** solo Chat, Courses y Profile.
- **Idioma:** inglés como base y selector de idioma en la app. Traducción literal, nada de reescribir textos. "Estudiante" es "Catcher". "Bóveda del conocimiento" es "Knowledge Vault".
- **Nombres de drills** ya corregidos en la base de datos: "Resistance Band - Back" y "Blocking Stick".
- Stripe entra en v1, pero sin bloqueo durante la prueba. Amigos y mensajes directos quedan para después de v1.

## Plan restante, en orden

1. Terminar el paso 2 (arriba) y que G revise antes del commit.
2. Crear los 5 canales de v1 en la tabla `channels` y mostrar solo esos: `get-feedback` (categoría WORK CHAT) y `daily-GM`, `daily-lesson`, `daily-schedule`, `daily-accountability` (categoría DAILY MOVE TO WIN). Los 10 canales viejos no se borran.
3. Que la Bóveda lea los drills de la tabla `videos`. Hoy los Playback IDs están fijos en `courses-view.tsx`. Hace falta una columna `skill` y una de posición para el orden: cambio de schema, requiere aprobación de G.
4. Subir clips en #get-feedback. Hoy el botón del clip en `chat-view.tsx` no hace nada.
5. Probar con el hermano de G: login, ver un drill, subir un clip, leer la respuesta escrita de G.
6. Después de la prueba: selector de idioma (archivos en y es, columna `language` en `profiles`) y arreglar el webhook de Stripe.

## Base de datos real (verificada el 1 de octubre de 2026)

Proyecto de Supabase "GRIP" (ref `udwqwndnpwkqugepoouq`). Hay 15 tablas en `public`, todas con RLS activo:

- `channels` (10 filas, son los canales viejos), `messages` (3), `reactions` (2), `saved_messages` (1), `notifications` (0), `pinned_resources` (0)
- `profiles` (6), `videos` (10), `leads` (4, sin uso, no tocar)
- Sin datos y fuera de v1: `course_progress`, `mission_progress`, `protocol_progress`, `feedback_submissions`, `live_calls`, `cursos`

Columnas que importan:

- `profiles`: id, username, phone, phone_verified, created_at, avatar_url, nivel, power_points, login_streak, bio, full_name, display_name, role, activo
- `messages`: id, channel_id, user_id, content, reply_to, created_at (no tiene columna de video)
- `channels`: id, slug, name, description, category, is_broadcast, sort_order, created_at, emoji
- `videos`: id, kind, ref_id, playback_id, title, user_id, created_at (no tiene categoría ni orden)

Hay un trigger `on_auth_user_created` que crea la fila en `profiles` al registrarse. Las tablas con nombres en español que se habían creado antes ya no existen.

Los 10 drills de `videos`:

- Blocking: Blocking Aqua Bag, Blocking Stick, Blocking Regular Glove
- Framing: Resistance Band - Back, Assistance Resistance - Front, CB Boz - Wrist Band
- Throwing: Front Toss Plyo, Walk Back Plyo, Forward Walk Plyo, Circle Aquabag One Knee

## Problemas conocidos

- `supabase/functions/stripe-webhook/index.ts` escribe en `perfiles` y la tabla real es `profiles` (que sí tiene la columna `activo`). Se arregla cuando toque Stripe.
- `courses-view.tsx` tiene Playback IDs fijos. Las lecciones "¿Qué es GRIP?" y "Cómo usar la plataforma" usan un ID de relleno, el mismo de Blocking Aqua Bag.
- `lib/dashboard/data.ts` tiene arrays de datos inventados (`MESSAGES`, `MEMBERS`, `COURSES`). Se conservan solo los tipos.
- `app/auth/error/page.tsx` y `app/auth/sign-up-success/page.tsx` usan `AuthShell`. Deben rediseñarse con `AuthScreen` + `AuthCard` + `MatrixRain`, como el resto del acceso.
- `next.config.mjs` tiene `ignoreBuildErrors: true`, así que el build no revisa tipos. `tsc --noEmit` muestra 24 errores de TypeScript que ya existían: 10 en `components/auth/matrix-rain.tsx`, 9 en `supabase/functions/stripe-webhook/index.ts` y 1 en cada uno de `app/api/mux/webhook/route.ts`, `app/auth/error/page.tsx`, `app/auth/sign-up-success/page.tsx`, `app/membership/page.tsx` y `components/mux/mux-video-player.tsx`. No se arreglan ahora.
- El `proxy.ts` de la raíz solo refresca la sesión: no protege rutas ni revisa pagos.
- `components/daily/*` y `app/api/progress/courses` están marcados como "ocultar" pero algo que se queda todavía los importa. No borrarlos sin cambiar antes esos imports.
- Seguridad, aparcada hasta antes de abrir a más usuarios (ver "Etapas" en `GRIP-SPEC.md`): las políticas de `profiles` dejan que cada usuario edite cualquiera de sus columnas (`activo`, `role`, `nivel`), crear y borrar su propia fila, y hay políticas duplicadas. En `videos`, cualquier usuario puede insertar con `kind` libre. El pago no se revisa en la base de datos y la reproducción de Mux es pública.

## Local setup, verified on Oct 1

Local login, signup and password reset work. Required: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (variable name exactly as read by `lib/supabase/admin.ts`; it must never start with `NEXT_PUBLIC_` and must never be committed), and `http://localhost:3000/**` in Supabase Authentication > URL Configuration > Redirect URLs. The Site URL stays at `https://catching-university.vercel.app`. Dev server must run on port 3000.

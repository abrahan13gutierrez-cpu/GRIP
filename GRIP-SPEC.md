# GRIP v1: especificación del proyecto

Poner este archivo en la raíz de la carpeta `grip` para que Antigravity lo use como contexto en cada tarea.

## Qué es

App móvil-first para catchers. Dos cosas centrales:

1. Ver drills en video.
2. Subir un clip propio y recibir feedback por chat.

La comunidad vive en un chat estilo Discord. Todo está pensado primero para celular.

## Usuarios

- **Primero:** un catcher (el hermano de G) y G como coach.
- **Después:** más catchers y capitanes (catchers de rango alto que responden feedback).

## Etapas

- **Etapa 1 (ahora):** prueba con un solo usuario, el hermano de G. Meta: que entre, vea los drills, suba un clip en #get-feedback y lea la respuesta escrita de G.
- **Etapa 2:** si la prueba funciona, el progreso y los resultados de su hermano traen a otros catchers de su academia.
- **Antes de abrir la puerta a más usuarios** (aparcado: durante la Etapa 1 no se trabaja en esto, solo queda anotado):
  - Permisos por columna en `profiles`: hoy cada usuario puede editar su propio `activo`, `role` y `nivel`. Restringir también las inserciones en `videos`.
  - Reproducción firmada en Mux. Hoy es pública.
  - Revisar el pago también en el servidor y en la base de datos, no solo en pantalla.
  - Limpiar las políticas duplicadas de `profiles`.
  - Permiso de los padres para menores de edad (a decidir con G).

## Language

- English is the source language of the whole app: UI text, error messages, motivational phrases, channel names, tables and columns.
- All UI text lives in translation files, never hardcoded in components. English is the source of truth; other languages are extra files (start with Spanish).
- A language selector in profile/settings lets each user switch the interface language. Default is English.
- The choice is saved in the user's profile (new `language` column in `profiles`, default 'en'). This is a schema change and needs my approval first.
- Only the interface is translated. User-written content (chat messages, feedback, usernames) is never translated automatically.
- Any missing translation falls back to English.
- The role label "Estudiante" is "Catcher" in English (chat and profile).
- Translate literally. Never rewrite, shorten, improve or replace any text. If a string is ambiguous or has no clean equivalent, list it and wait for G's approval before using any version.
- The existing Spanish strings are not thrown away: they become the Spanish translation file, and the English version becomes the source file.
- Official tables are the English ones the code already uses: profiles, channels, messages, reactions, saved_messages, notifications, course_progress, mission_progress, videos.
- Tables with Spanish names (`channel`, `mensajes`, `reacciones`, `progreso_mision`, `perfiles`, etc.) come from an earlier schema and are obsolete. Do not use them.

## Alcance de v1

### 1. Acceso
- Login y registro con email y contraseña, y con teléfono más código OTP.
- Recuperar contraseña.
- Todo el flujo comparte el mismo diseño: fondo tipo lluvia Matrix y tarjeta centrada. Ninguna pantalla de auth cambia de estilo.
- Al registrarse se crea su fila en `profiles` (ya existe un trigger para esto en Supabase).

### 2. Cursos: Bóveda del conocimiento
- La Bóveda del conocimiento se mantiene. Su nombre en inglés es "Knowledge Vault". No renombrarla, no quitarla y no cambiar su descripción más allá de una traducción literal.
- Drills en video (Mux), ordenados por habilidad: Blocking, Framing, Throwing y las que se agreguen.
- El catcher los ve con el reproductor de lección (video a un lado, lista de lecciones al otro).
- Los videos se leen de la tabla `videos` en Supabase, no de IDs fijos en el código.

### 3. Chat (estilo Discord)
Canales de v1:

- **WORK CHAT**
  - `#get-feedback`: el catcher sube su clip de video. G (más adelante también los capitanes) responde por escrito en el mismo chat. Los clips son públicos para toda la comunidad.
- **DAILY MOVE TO WIN**
  - `#daily-GM`
  - `#daily-lesson`
  - `#daily-schedule`
  - `#daily-accountability`

En v1 los canales daily son solo para publicar y participar. Sin puntos, sin rachas, sin rangos.

Requisitos del chat:
- Los mensajes y las reacciones se guardan de verdad en Supabase (`messages`, `reactions`).
- Aparecen en tiempo real (Supabase Realtime), sin recargar.
- Se puede subir un video dentro de `#get-feedback` desde el celular.
- Acciones sobre mensajes: reaccionar con emoji, responder, copiar, guardar.

### 4. Perfil básico
Foto, nombre de usuario, selector de idioma y cerrar sesión.

### 5. Membresía (Stripe)
- El cobro de membresía con Stripe entra en v1. Se mantienen las páginas `/` y `/membership` y la función `stripe-webhook`.
- Problema conocido: `stripe-webhook` actualiza la tabla `perfiles` (obsoleta) en vez de `profiles`. Hay que corregirlo, con aprobación de G.
- Sin membresía activa no se puede entrar a la app: después de registrarse, el usuario paga antes de acceder.
- Acceso gratis: columna `free_access` (boolean, default false) en `profiles`. G la activa a mano en Supabase para él, para su hermano y, más adelante, para los capitanes. La app deja entrar a quien tenga suscripción activa de Stripe o `free_access = true`.
- `free_access` nunca debe poder cambiarla el propio usuario. Hay que bloquear esa columna en las políticas de RLS para que solo la modifique el service role o un admin. Es un cambio de schema y requiere aprobación de G.
- En v1 hay un solo nivel de membresía, lo más simple posible. Un nivel superior que desbloquee agregar amigos y mensajes directos entre amigos queda para después, cuando haya más usuarios.
- Todavía no están definidos el precio ni si hay prueba gratis. No cambiar precios ni la lógica de acceso hasta que G los defina.

## Fuera de v1

No borrar las tablas de Supabase. Solo quitar de la interfaz:

- Mercado, Cartera, Nivel, Checklist
- Amigos y mensajes directos entre amigos (los desbloqueará un nivel superior de membresía, más adelante)
- Protocolo de niveles y tarjetas de Cursos que no sean drills
- Llamadas en vivo (Daily.co)
- Herramienta propia de anotación de video
- Puntos, rachas y rangos

## Decisiones pendientes

- Membresía: precio y si hay prueba gratis.

## Stack

- Next.js y React
- Supabase (auth, base de datos, realtime)
- Mux (video)
- Se construye con Antigravity, ya no con V0

## Reglas de trabajo para el agente

- Móvil primero, verificar en pantalla angosta.
- Nunca borrar tablas ni datos de Supabase.
- Trabajar siempre en una rama de git, nunca directo en `main`.
- Antes de borrar archivos, listarlos y esperar aprobación.
- Antes de escribir una consulta, leer las columnas reales de la tabla. No asumir nombres. La tabla `videos` usa `playback_id`, `kind`, `ref_id`, `title` y `user_id`; confirmar el resto.
- Las claves de Supabase y Mux van solo en variables de entorno, nunca en el código ni pegadas en chats.
- Durante la Etapa 1, no trabajar en los puntos de "Antes de abrir la puerta a más usuarios".
- No tomar decisiones de contenido, textos, nombres o diseño por cuenta propia. Si algo no está en este archivo, preguntar a G y esperar su respuesta.
- Probar cada cambio antes de decir que está listo. "Compila" no es lo mismo que "funciona".
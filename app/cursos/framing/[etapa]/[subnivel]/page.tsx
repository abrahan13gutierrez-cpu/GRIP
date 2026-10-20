import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getFramingUnit } from "@/lib/framing/curriculum"
import { getFramingProgress, statusOf } from "@/lib/framing/progress"
import { FramingCycle } from "@/components/framing/framing-cycle"

/**
 * Ruta real y deep-linkeable de cada unidad de Framing: /cursos/framing/[etapa]/[subnivel].
 * Protegida server-side: requiere sesión y membresía activa (profiles.activo).
 * Un usuario sin membresía no puede ver el contenido, aunque conozca la URL.
 */
export default async function FramingUnitPage({
  params,
}: {
  params: Promise<{ etapa: string; subnivel: string }>
}) {
  const { etapa, subnivel } = await params

  const unit = getFramingUnit(etapa, subnivel)
  if (!unit) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/cursos/framing/${etapa}/${subnivel}`)

  const { data: profile } = await supabase.from("profiles").select("activo").eq("id", user.id).maybeSingle()
  if (profile?.activo !== true) redirect("/membership")

  const progress = await getFramingProgress(supabase, user.id)
  const status = statusOf(progress, unit.etapaSlug, unit.subnivelSlug)

  return <FramingCycle unit={unit} initialStatus={status} />
}

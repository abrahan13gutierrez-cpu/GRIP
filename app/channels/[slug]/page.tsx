import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getChannelBySlug, getChannels, getMessages, getPinnedResources } from "@/lib/platform/queries"
import { PlatformShell } from "@/components/platform/platform-shell"

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const channel = await getChannelBySlug(slug)
  if (!channel) notFound()

  const [channels, pinned, messages] = await Promise.all([
    getChannels(),
    getPinnedResources(channel.id),
    getMessages(channel.id),
  ])

  return <PlatformShell channels={channels} channel={channel} pinned={pinned} messages={messages} />
}

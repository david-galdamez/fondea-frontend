import { UpdatesManager } from '@/components/creator/updates/updates-manager'

export default async function CampaignUpdatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <UpdatesManager campaignId={id} />
}

import { BackersList } from '@/components/creator/backers/backers-list'

export default async function CampaignBackersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BackersList campaignId={id} />
}

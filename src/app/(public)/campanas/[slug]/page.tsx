import { CampaignDetail } from '@/components/campaigns/campaign-detail'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CampaignDetail slug={slug} />
}

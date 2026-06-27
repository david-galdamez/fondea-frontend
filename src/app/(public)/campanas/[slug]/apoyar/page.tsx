import { PledgeFlow } from '@/components/pledges/pledge-flow'

export default async function SupportCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <PledgeFlow slug={slug} />
}

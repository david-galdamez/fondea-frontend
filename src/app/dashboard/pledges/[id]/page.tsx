import { PledgeDetail } from '@/components/pledges/pledge-detail'

export default async function PledgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PledgeDetail id={id} />
}

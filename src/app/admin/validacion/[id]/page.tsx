import { ValidationDetail } from '@/components/admin/validation-detail'

export default async function ValidationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ValidationDetail campaignId={id} />
}

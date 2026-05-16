import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function CampaignUpdatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Actualizaciones"
      description={`Lista y publicación de updates para la campaña ${id}.`}
    />
  )
}

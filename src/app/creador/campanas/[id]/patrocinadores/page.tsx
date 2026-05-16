import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function CampaignBackersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Patrocinadores"
      description={`Lista de quien apoyó la campaña ${id} (respetando los pledges anónimos).`}
    />
  )
}

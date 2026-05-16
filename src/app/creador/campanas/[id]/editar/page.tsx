import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Editar campaña"
      description={`Editor del borrador "${id}" (solo accesible en estado draft o rejected).`}
    />
  )
}

import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function CampaignFAQsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Preguntas frecuentes"
      description={`Gestión de FAQs para la campaña ${id}.`}
    />
  )
}

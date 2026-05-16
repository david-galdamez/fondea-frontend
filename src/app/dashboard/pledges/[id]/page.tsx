import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function PledgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PagePlaceholder
      title={`Pledge ${id}`}
      description="Detalle del pledge: estado, recompensa elegida, recibo."
    />
  )
}

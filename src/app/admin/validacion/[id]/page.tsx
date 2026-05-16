import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function ValidationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Revisar campaña"
      description={`Vista de revisión de la campaña ${id} con acciones de aprobar, rechazar (con motivo) y marcar destacada.`}
    />
  )
}

import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function FraudReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Detalle del reporte"
      description={`Detalle y resolución del reporte de fraude ${id}.`}
    />
  )
}

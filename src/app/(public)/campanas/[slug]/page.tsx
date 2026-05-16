import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-6xl px-4">
      <PagePlaceholder
        title={`Campaña: ${slug}`}
        description="Detalle de campaña con descripción, recompensas, updates públicas, FAQ, progreso y botón apoyar."
      />
    </div>
  )
}

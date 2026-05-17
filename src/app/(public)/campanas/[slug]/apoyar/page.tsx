import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function SupportCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-2xl px-4">
      <PagePlaceholder
        title="Apoyar campaña"
        description={`Flujo de pledge para "${slug}" — elegir recompensa, confirmar monto y completar la promesa.`}
      />
    </div>
  )
}

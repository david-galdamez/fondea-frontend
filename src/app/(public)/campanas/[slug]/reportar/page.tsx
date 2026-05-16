import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function ReportFraudPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-2xl px-4">
      <PagePlaceholder
        title="Reportar campaña"
        description={`Formulario para reportar la campaña "${slug}" por sospecha de fraude.`}
      />
    </div>
  )
}

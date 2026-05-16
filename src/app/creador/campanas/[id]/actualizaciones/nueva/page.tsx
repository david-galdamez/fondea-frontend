import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function NewUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PagePlaceholder
      title="Nueva actualización"
      description={`Editor de update para la campaña ${id} (público / solo backers).`}
    />
  )
}

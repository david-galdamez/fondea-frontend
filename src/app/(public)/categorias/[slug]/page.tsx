import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-6xl px-4">
      <PagePlaceholder
        title={`Categoría: ${slug}`}
        description="Listado pre-filtrado por categoría."
      />
    </div>
  )
}

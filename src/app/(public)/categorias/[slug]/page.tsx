import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { categoriesService } from '@/lib/api'
import { CategoryCampaigns } from '@/components/campaigns/category-campaigns'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // El segmento [slug] transporta el id de la categoría; el backend solo expone el listado.
  const categories = await categoriesService.list()
  const category = categories.find((c) => c.id === slug)
  if (!category) notFound()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Link
        href="/explorar"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Volver a explorar
      </Link>
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Categoría
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
      </header>
      <CategoryCampaigns categoryId={category.id} />
    </div>
  )
}

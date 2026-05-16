import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function ExplorarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <PagePlaceholder
        title="Explorar campañas"
        description="Listado con filtros (categoría, ubicación, estado, ordenamiento) y paginación."
      />
    </div>
  )
}

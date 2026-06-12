'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Category, SearchFilters, SortBy } from '@/types'
import type { CampaignSummaryDto } from '@/lib/api/campaigns.service'
import { campaignsService, categoriesService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CampaignCard } from './campaign-card'
import { CampaignCardSkeleton } from './campaign-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'ending_soon', label: 'Pronto a cerrar' },
  { value: 'most_funded', label: 'Más financiadas' },
  { value: 'most_backers', label: 'Más apoyadas' },
  { value: 'featured', label: 'Destacadas primero' },
]

const PAGE_SIZE = 12

function readFilters(params: URLSearchParams): SearchFilters {
  return {
    query: params.get('query') ?? undefined,
    categoryId: params.get('category') ?? undefined,
    country: params.get('country') ?? undefined,
    city: params.get('city') ?? undefined,
    sortBy: (params.get('sort') as SortBy | null) ?? 'recent',
    page: Number(params.get('page')) || 1,
    pageSize: PAGE_SIZE,
  }
}

function buildSearchParams(filters: Partial<SearchFilters>): string {
  const sp = new URLSearchParams()
  if (filters.query) sp.set('query', filters.query)
  if (filters.categoryId) sp.set('category', filters.categoryId)
  if (filters.country) sp.set('country', filters.country)
  if (filters.city) sp.set('city', filters.city)
  if (filters.sortBy && filters.sortBy !== 'recent') sp.set('sort', filters.sortBy)
  if (filters.page && filters.page > 1) sp.set('page', String(filters.page))
  return sp.toString()
}

export function sortCampaigns(items: CampaignSummaryDto[], sortBy: SortBy): CampaignSummaryDto[] {
  const sorted = [...items]
  switch (sortBy) {
    case 'ending_soon':
      return sorted.sort((a, b) => a.deadline.localeCompare(b.deadline))
    case 'most_funded':
      return sorted.sort((a, b) => b.totalPledged - a.totalPledged)
    case 'most_backers':
      return sorted.sort((a, b) => b.pledgeCount - a.pledgeCount)
    case 'featured':
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
    default:
      return sorted
  }
}

const SELECT_CLASS =
  'border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function ExploreClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = useMemo(() => readFilters(searchParams), [searchParams])

  const [categories, setCategories] = useState<Category[]>([])
  const [campaigns, setCampaigns] = useState<CampaignSummaryDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    categoriesService
      .list()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    campaignsService
      .search({ categoryId: filters.categoryId, keyword: filters.query })
      .then((res) => {
        if (cancelled) return
        setCampaigns(res)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters.categoryId, filters.query, retryKey])

  function handleRetry() {
    setError(false)
    setRetryKey((k) => k + 1)
  }

  function updateFilters(patch: Partial<SearchFilters>) {
    const next: Partial<SearchFilters> = { ...filters, ...patch, page: patch.page ?? 1 }
    const qs = buildSearchParams(next)
    router.replace(qs ? `/explorar?${qs}` : '/explorar')
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get('query') ?? '').trim()
    updateFilters({ query: q || undefined })
  }

  function clearFilters() {
    router.replace('/explorar')
  }

  const hasActiveFilters =
    !!filters.query ||
    !!filters.categoryId ||
    !!filters.country ||
    !!filters.city ||
    (filters.sortBy && filters.sortBy !== 'recent')

  // El backend filtra por categoría y keyword; país, ciudad, orden y paginación se aplican aquí.
  const visible = useMemo(() => {
    if (!campaigns) return null
    const country = filters.country?.trim().toLowerCase()
    const city = filters.city?.trim().toLowerCase()
    const filtered = campaigns.filter((c) => {
      if (country && !c.locationCountry.toLowerCase().includes(country)) return false
      if (city && !c.locationCity.toLowerCase().includes(city)) return false
      return true
    })
    return sortCampaigns(filtered, filters.sortBy ?? 'recent')
  }, [campaigns, filters.country, filters.city, filters.sortBy])

  const total = visible?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(filters.page ?? 1, totalPages)
  const pageItems = visible?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ?? []

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Explorar campañas</h1>
        <p className="text-muted-foreground text-sm">
          Encuentra proyectos por categoría, ubicación o estado.
        </p>
      </header>

      <form onSubmit={handleSearchSubmit} role="search" className="relative max-w-xl">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          key={filters.query ?? ''}
          type="search"
          name="query"
          defaultValue={filters.query ?? ''}
          placeholder="Buscar por título, resumen o tags…"
          className="pl-8"
          aria-label="Buscar campañas"
        />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category">Categoría</Label>
          <select
            id="filter-category"
            className={SELECT_CLASS}
            value={filters.categoryId ?? ''}
            onChange={(e) => updateFilters({ categoryId: e.target.value || undefined })}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-country">País</Label>
          <Input
            id="filter-country"
            value={filters.country ?? ''}
            onChange={(e) => updateFilters({ country: e.target.value || undefined })}
            placeholder="México, Perú…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-city">Ciudad</Label>
          <Input
            id="filter-city"
            value={filters.city ?? ''}
            onChange={(e) => updateFilters({ city: e.target.value || undefined })}
            placeholder="Ciudad de México…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-sort">Ordenar por</Label>
          <select
            id="filter-sort"
            className={SELECT_CLASS}
            value={filters.sortBy ?? 'recent'}
            onChange={(e) => updateFilters({ sortBy: e.target.value as SortBy })}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          {visible ? `${total} resultado${total === 1 ? '' : 's'}` : ' '}
        </span>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState onRetry={handleRetry} />
      ) : loading || !visible ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No encontramos campañas con esos filtros"
          description="Prueba quitando algún filtro o cambiando los términos de búsqueda."
          action={
            hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Paginación">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateFilters({ page: currentPage - 1 })}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateFilters({ page: currentPage + 1 })}
              >
                Siguiente
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

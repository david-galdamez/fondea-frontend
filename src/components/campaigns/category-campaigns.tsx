'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { SortBy } from '@/types'
import type { CampaignSummaryDto } from '@/lib/api/campaigns.service'
import { campaignsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CampaignCard } from './campaign-card'
import { CampaignCardSkeleton } from './campaign-card-skeleton'
import { sortCampaigns } from './explore-client'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'ending_soon', label: 'Pronto a cerrar' },
  { value: 'most_funded', label: 'Más financiadas' },
  { value: 'most_backers', label: 'Más apoyadas' },
]

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface CategoryCampaignsProps {
  categoryId: string
}

export function CategoryCampaigns({ categoryId }: CategoryCampaignsProps) {
  const [campaigns, setCampaigns] = useState<CampaignSummaryDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    campaignsService
      .search({ categoryId })
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
  }, [categoryId, retryKey])

  function handleRetry() {
    setError(false)
    setRetryKey((k) => k + 1)
  }

  const visible = useMemo(
    () => (campaigns ? sortCampaigns(campaigns, sortBy) : null),
    [campaigns, sortBy]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {visible ? `${visible.length} campaña${visible.length === 1 ? '' : 's'}` : ' '}
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="category-sort" className="text-xs">
            Ordenar
          </Label>
          <select
            id="category-sort"
            className={SELECT_CLASS}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
          title="Aún no hay campañas en esta categoría"
          description="Vuelve pronto o explora otras categorías."
          action={
            <Button
              render={<a href="/explorar">Ver todas las campañas</a>}
              variant="outline"
              size="sm"
            />
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}

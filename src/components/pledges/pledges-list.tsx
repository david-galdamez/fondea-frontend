'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HandHeart } from 'lucide-react'
import type { Campaign, Pledge, PledgeStatus } from '@/types'
import { campaignsService, pledgesService } from '@/lib/api'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { RowsSkeleton } from '@/components/common/page-skeleton'
import { PledgeListItem } from './pledge-list-item'

const STATUS_OPTIONS: { value: '' | PledgeStatus; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'authorized', label: 'Autorizados' },
  { value: 'charged', label: 'Cobrados' },
  { value: 'refunded', label: 'Reembolsados' },
  { value: 'cancelled', label: 'Cancelados' },
]

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface PledgesData {
  pledges: Pledge[]
  campaignsById: Map<string, Campaign>
}

export function PledgesList() {
  const { session } = useSession()
  const userId = session?.user.id

  const [data, setData] = useState<PledgesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'' | PledgeStatus>('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    pledgesService
      .listByBacker(userId, 1, 100)
      .then(async (res) => {
        const ids = Array.from(new Set(res.items.map((p) => p.campaignId)))
        const campaigns = await Promise.all(
          ids.map((id) => campaignsService.getById(id).catch(() => null))
        )
        if (cancelled) return
        const campaignsById = new Map<string, Campaign>()
        campaigns.forEach((c) => {
          if (c) campaignsById.set(c.id, c)
        })
        setData({ pledges: res.items, campaignsById })
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
  }, [userId, retryKey])

  function handleRetry() {
    setError(false)
    setRetryKey((k) => k + 1)
  }

  const visiblePledges =
    data?.pledges.filter((p) => !statusFilter || p.status === statusFilter) ?? []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Mis promesas</h1>
        <p className="text-muted-foreground text-sm">
          Historial de pledges hechos a campañas. Solo se cobran las promesas autorizadas si la
          campaña alcanza su meta.
        </p>
      </header>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-xs">
            Estado
          </Label>
          <select
            id="status-filter"
            className={SELECT_CLASS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | PledgeStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {data && (
          <span className="text-muted-foreground text-sm">
            {visiblePledges.length} de {data.pledges.length}
          </span>
        )}
      </div>

      {error ? (
        <ErrorState onRetry={handleRetry} />
      ) : loading || !data ? (
        <RowsSkeleton count={4} rowHeight="h-20" />
      ) : visiblePledges.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title={
            data.pledges.length === 0
              ? 'Aún no apoyas ninguna campaña'
              : 'Sin promesas con ese estado'
          }
          description={
            data.pledges.length === 0
              ? 'Explora campañas activas y promete tu primer apoyo.'
              : 'Cambia el filtro para ver otras promesas.'
          }
          action={
            data.pledges.length === 0 && (
              <Button render={<Link href="/explorar" />} variant="outline" size="sm">
                Explorar campañas
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {visiblePledges.map((p) => (
            <PledgeListItem
              key={p.id}
              pledge={p}
              campaign={data.campaignsById.get(p.campaignId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

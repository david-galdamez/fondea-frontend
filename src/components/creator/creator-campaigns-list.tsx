'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import type { Campaign, CampaignStatus } from '@/types'
import { campaignsService } from '@/lib/api'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { CreatorCampaignCard } from './creator-campaign-card'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const STATUS_OPTIONS: { value: CampaignStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'pending_review', label: 'En revisión' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'active', label: 'Activas' },
  { value: 'successful', label: 'Exitosas' },
  { value: 'failed', label: 'No alcanzaron meta' },
  { value: 'cancelled', label: 'Canceladas' },
]

export function CreatorCampaignsList() {
  const { session } = useSession()
  const userId = session?.user.id

  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('')

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    campaignsService
      .getByCreator(userId)
      .then((items) => {
        if (cancelled) return
        setCampaigns(items)
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

  const visible = useMemo(() => {
    if (!campaigns) return []
    const filtered = statusFilter ? campaigns.filter((c) => c.status === statusFilter) : campaigns
    return [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [campaigns, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Mis campañas</h1>
          <p className="text-muted-foreground text-sm">
            Crea, edita y administra todas tus campañas.
          </p>
        </div>
        <Button render={<Link href="/creador/campanas/nueva" />} size="sm">
          <Plus className="size-4" />
          Nueva campaña
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-xs">
          Estado
        </Label>
        <select
          id="status-filter"
          className={SELECT_CLASS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
      ) : loading || !campaigns ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={
            campaigns.length === 0
              ? 'Aún no tienes campañas'
              : 'Sin campañas con ese estado'
          }
          description={
            campaigns.length === 0
              ? 'Comienza creando tu primera campaña para llevarla a revisión.'
              : undefined
          }
          action={
            campaigns.length === 0 && (
              <Button render={<Link href="/creador/campanas/nueva" />} variant="outline" size="sm">
                <Plus className="size-4" />
                Crear campaña
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((c) => (
            <CreatorCampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}

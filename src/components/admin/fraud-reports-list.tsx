'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight, Flag } from 'lucide-react'
import type { Campaign, FraudReport, FraudReportStatus } from '@/types'
import { adminService, fraudService } from '@/lib/api'
import { formatShortDate } from '@/lib/dates'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const STATUS_OPTIONS: { value: FraudReportStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'reviewing', label: 'En revisión' },
  { value: 'resolved', label: 'Resueltos' },
  { value: 'dismissed', label: 'Descartados' },
]

const STATUS_LABEL: Record<FraudReportStatus, string> = {
  open: 'Abierto',
  reviewing: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

const STATUS_CLASSES: Record<FraudReportStatus, string> = {
  open: 'bg-destructive/10 text-destructive',
  reviewing: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  resolved: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  dismissed: 'bg-muted text-muted-foreground',
}

interface Data {
  reports: FraudReport[]
  campaignsById: Map<string, Campaign>
}

export function FraudReportsList() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState<FraudReportStatus | ''>('')

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<Data> {
      const [page, allCampaigns] = await Promise.all([
        fraudService.listAll(statusFilter || undefined, 1, 100),
        adminService.listAll(),
      ])
      const campaignsById = new Map<string, Campaign>()
      allCampaigns.forEach((c) => campaignsById.set(c.id, c))
      return { reports: page.items, campaignsById }
    }
    load()
      .then((d) => {
        if (cancelled) return
        setData(d)
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
  }, [retryKey, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Reportes de fraude</h1>
        <p className="text-muted-foreground text-sm">
          Reportes enviados por la comunidad sobre posibles campañas fraudulentas.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-xs">
          Estado
        </Label>
        <select
          id="status-filter"
          className={SELECT_CLASS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FraudReportStatus | '')}
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
      ) : loading || !data ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : data.reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={statusFilter ? `Sin reportes ${STATUS_LABEL[statusFilter as FraudReportStatus].toLowerCase()}` : 'Sin reportes registrados'}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.reports.map((r) => {
            const campaign = data.campaignsById.get(r.campaignId)
            return (
              <Link
                key={r.id}
                href={`/admin/fraude/${r.id}`}
                className="group border-border bg-card hover:border-foreground/20 flex items-center gap-3 rounded-lg border p-4 transition-colors"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">
                    {campaign?.title ?? 'Campaña eliminada'}
                  </p>
                  <p className="text-muted-foreground line-clamp-1 text-xs">{r.details}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground text-xs">
                    {formatShortDate(r.createdAt)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

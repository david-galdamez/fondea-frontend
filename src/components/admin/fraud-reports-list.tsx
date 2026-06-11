'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight, Flag } from 'lucide-react'
import { fraudService } from '@/lib/api'
import type { FraudReportDto, FraudReportStatus } from '@/lib/api/fraud.service'
import { formatShortDate } from '@/lib/dates'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { RowsSkeleton } from '@/components/common/page-skeleton'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const STATUS_OPTIONS: { value: FraudReportStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'REVIEWING', label: 'En revisión' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'DISMISSED', label: 'Descartados' },
]

const STATUS_LABEL: Record<FraudReportStatus, string> = {
  PENDING: 'Pendiente',
  REVIEWING: 'En revisión',
  RESOLVED: 'Resuelto',
  DISMISSED: 'Descartado',
}

const STATUS_CLASSES: Record<FraudReportStatus, string> = {
  PENDING: 'bg-destructive/10 text-destructive',
  REVIEWING: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  RESOLVED: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  DISMISSED: 'bg-muted text-muted-foreground',
}

export function FraudReportsList() {
  const [reports, setReports] = useState<FraudReportDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState<FraudReportStatus | ''>('')

  useEffect(() => {
    let cancelled = false
    fraudService
      .listAll(statusFilter || undefined, 1, 100)
      .then((items) => {
        if (cancelled) return
        setReports(items)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => { cancelled = true }
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
      ) : loading || !reports ? (
        <RowsSkeleton count={4} rowHeight="h-20" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={
            statusFilter
              ? `Sin reportes ${STATUS_LABEL[statusFilter as FraudReportStatus].toLowerCase()}`
              : 'Sin reportes registrados'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/admin/fraude/${r.id}`}
              className="group border-border bg-card hover:border-foreground/20 flex items-center gap-3 rounded-lg border p-4 transition-colors"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-medium">{r.campaignTitle}</p>
                <p className="text-muted-foreground line-clamp-1 text-xs">
                  {r.reason}
                  {r.reporterName && ` — por ${r.reporterName}`}
                </p>
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
              <ChevronRight
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

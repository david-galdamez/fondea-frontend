'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Download, Megaphone, Sheet, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError, adminService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { RowsSkeleton } from '@/components/common/page-skeleton'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { StatusBadge } from '@/components/campaigns/status-badge'
import { CampaignStatus, CampaignSummaryDto } from '@/lib/api/campaigns.service'
import { money } from '@/lib/money'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const STATUS_OPTIONS: { value: CampaignStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'UNDER_REVIEW', label: 'En revisión' },
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'SUCCESSFUL', label: 'Exitosa' },
  { value: 'FAILED', label: 'Cancelada' },
]

export function AllCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummaryDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportingSheets, setExportingSheets] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await adminService.exportCampaignsCsv()
      toast.success('Exportación generada')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo exportar las campañas'
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  async function handleExportSheets() {
    setExportingSheets(true)
    try {
      const { spreadsheetUrl } = await adminService.exportCampaignsToGoogleSheets()
      toast.success('Exportación a Google Sheets en proceso', {
        description: 'Las campañas aparecerán en la hoja en unos segundos.',
        action: spreadsheetUrl
          ? { label: 'Abrir hoja', onClick: () => window.open(spreadsheetUrl, '_blank') }
          : undefined,
      })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo exportar a Google Sheets'
      toast.error(message)
    } finally {
      setExportingSheets(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    adminService
      .listAll()
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
  }, [retryKey])

  const visible = useMemo(() => {
    if (!campaigns) return []
    return campaigns
      .filter((c) => !statusFilter || c.status === statusFilter)
      .filter((c) => !featuredOnly || c.featured)
      .sort((a, b) => b.deadline.localeCompare(a.deadline))
  }, [campaigns, statusFilter, featuredOnly])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Todas las campañas</h1>
          <p className="text-muted-foreground text-sm">
            Vista completa con filtros y acciones de moderación.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="size-4" />
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
          <Button variant="outline" onClick={handleExportSheets} disabled={exportingSheets}>
            <Sheet className="size-4" />
            {exportingSheets ? 'Exportando…' : 'Exportar a Google Sheets'}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
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
      </div>

      {error ? (
        <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
      ) : loading || !campaigns ? (
        <RowsSkeleton count={4} rowHeight="h-24" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={campaigns.length === 0 ? 'Sin campañas en la plataforma' : 'Sin coincidencias'}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((c) => (
            <article
              key={c.id}
              className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="truncate text-sm font-medium">{c.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                </div>
              </header>
              <CampaignProgress
                raised={money(Math.round(c.totalPledged * 100))}
                goal={money(Math.round(c.goalAmount * 100))}
                backersCount={c.pledgeCount}
                size="sm"
              />
              <footer className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  Meta{' '}
                  <MoneyDisplay
                    value={money(Math.round(c.goalAmount * 100))}
                    className="text-foreground font-medium"
                  />
                </span>
                <div className="flex items-center gap-2">
                  {c.status === 'UNDER_REVIEW' && (
                    <Button
                      render={<Link href={`/admin/validacion/${c.id}`} />}
                      variant="outline"
                      size="sm"
                    >
                      Revisar
                    </Button>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

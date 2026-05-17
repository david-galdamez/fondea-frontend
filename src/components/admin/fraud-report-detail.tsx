'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, ChevronLeft, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign, FraudReason, FraudReport, User } from '@/types'
import { ApiError, campaignsService, fraudService, usersService } from '@/lib/api'
import { formatLongDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface FraudReportDetailProps {
  reportId: string
}

interface Data {
  report: FraudReport
  campaign: Campaign | null
  reporter: User | null
}

const REASON_LABEL: Record<FraudReason, string> = {
  misleading_info: 'Información engañosa',
  identity_theft: 'Suplantación de identidad',
  inappropriate_content: 'Contenido inapropiado',
  spam: 'Spam',
  other: 'Otro motivo',
}

export function FraudReportDetail({ reportId }: FraudReportDetailProps) {
  const router = useRouter()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<Data> {
      const report = await fraudService.getById(reportId)
      const [campaign, reporter] = await Promise.all([
        campaignsService.getById(report.campaignId).catch(() => null),
        usersService.getById(report.reporterId).catch(() => null),
      ])
      return { report, campaign, reporter }
    }
    load()
      .then((d) => {
        if (cancelled) return
        setData(d)
        setError(false)
        setLoading(false)
        setNotes(d.report.resolutionNotes ?? '')
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reportId, retryKey])

  async function handleResolve(status: 'resolved' | 'dismissed' | 'reviewing') {
    setBusy(true)
    try {
      const updated = await fraudService.resolve(reportId, status, notes.trim() || undefined)
      setData((prev) => (prev ? { ...prev, report: updated } : prev))
      toast.success(
        status === 'reviewing'
          ? 'Marcado en revisión'
          : status === 'resolved'
            ? 'Reporte resuelto'
            : 'Reporte descartado'
      )
      if (status !== 'reviewing') {
        router.push('/admin/fraude')
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos actualizar el reporte'
      toast.error(message)
      setBusy(false)
      return
    }
    setBusy(false)
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="detail" />

  const { report, campaign, reporter } = data
  const isOpen = report.status === 'open' || report.status === 'reviewing'

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/fraude"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Volver a reportes
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Reporte de fraude</h1>
        <p className="text-muted-foreground text-sm">
          Recibido el {formatLongDate(report.createdAt)}
          {report.resolvedAt && ` · Resuelto el ${formatLongDate(report.resolvedAt)}`}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
          <section className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Campaña reportada</h2>
            {campaign ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{campaign.title}</p>
                <p className="text-muted-foreground text-xs">{campaign.summary}</p>
                <Link
                  href={`/campanas/${campaign.slug}`}
                  className="text-primary mt-1 text-xs underline-offset-4 hover:underline"
                >
                  Ver campaña pública →
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Campaña eliminada o inaccesible.</p>
            )}
          </section>

          <section className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Detalles del reporte</h2>
            <div className="flex flex-col gap-2 text-sm">
              <DataRow label="Motivo" value={REASON_LABEL[report.reason]} />
              <DataRow
                label="Reportado por"
                value={reporter ? `${reporter.name} (${reporter.email})` : 'Usuario desconocido'}
              />
            </div>
            <p className="text-foreground/90 text-sm whitespace-pre-wrap">{report.details}</p>
          </section>

          {report.resolutionNotes && (
            <section className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">Notas de resolución previas</h2>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {report.resolutionNotes}
              </p>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Acciones</h2>
            {isOpen ? (
              <>
                <Label htmlFor="resolution-notes" className="text-xs">
                  Notas de resolución (opcional)
                </Label>
                <textarea
                  id="resolution-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
                {report.status === 'open' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve('reviewing')}
                    disabled={busy}
                  >
                    <Eye className="size-4" />
                    Marcar en revisión
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleResolve('resolved')}
                  disabled={busy}
                >
                  <Check className="size-4" />
                  Resolver
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResolve('dismissed')}
                  disabled={busy}
                >
                  <X className="size-4" />
                  Descartar
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-xs">
                Este reporte ya fue {report.status === 'resolved' ? 'resuelto' : 'descartado'}. No
                hay acciones disponibles.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

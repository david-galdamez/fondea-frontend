'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Banknote, Flag, ListChecks } from 'lucide-react'
import { adminService } from '@/lib/api'
import { money } from '@/lib/money'
import { formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import type { CampaignReviewDto, AdminWithdrawalDto, FraudReportDto } from '@/lib/api/admin.service'

interface DashboardData {
  pendingCampaigns: CampaignReviewDto[]
  pendingWithdrawals: AdminWithdrawalDto[]
  pendingFraudReports: FraudReportDto[]
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      adminService.getPendingCampaigns(),
      adminService.getPendingWithdrawals(),
      adminService.getPendingFraudReports(),
    ])
      .then(([pendingCampaigns, pendingWithdrawals, pendingFraudReports]) => {
        if (cancelled) return
        setData({ pendingCampaigns, pendingWithdrawals, pendingFraudReports })
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [retryKey])

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="summary" />

  const totalPendingWithdrawals = data.pendingWithdrawals.reduce(
    (acc, w) => acc + w.netAmount, 0
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Panel de administración</h1>
        <p className="text-muted-foreground text-sm">
          Estado general de la plataforma y elementos que requieren atención.
        </p>
      </header>

      {/* Stats */}
      <section aria-label="Estadísticas" className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={ListChecks}
          label="Campañas en revisión"
          value={String(data.pendingCampaigns.length)}
        />
        <StatCard
          icon={Banknote}
          label="Retiros pendientes"
          value={String(data.pendingWithdrawals.length)}
        />
        <StatCard
          icon={Flag}
          label="Reportes de fraude"
          value={String(data.pendingFraudReports.length)}
        />
      </section>

      {/* Campañas pendientes */}
      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Campañas pendientes de revisión</h2>
          <Button render={<Link href="/admin/validacion" />} variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.pendingCampaigns.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Sin campañas en revisión"
            description="No hay nada que validar por ahora."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {data.pendingCampaigns.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/admin/validacion/${c.id}`}
                className="group border-border bg-card hover:border-foreground/20 flex items-center gap-3 rounded-lg border p-4 transition-colors"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {c.creatorName} · Enviada el {formatShortDate(c.submittedAt)}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Retiros pendientes */}
      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Retiros pendientes</h2>
          <Button render={<Link href="/admin/retiros" />} variant="ghost" size="sm">
            Ver todos
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.pendingWithdrawals.length === 0 ? (
          <EmptyState icon={Banknote} title="Sin retiros pendientes" />
        ) : (
          <div className="flex flex-col gap-2">
            {data.pendingWithdrawals.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{w.campaignTitle}</p>
                  <p className="text-muted-foreground text-xs">
                    Solicitado el {formatShortDate(w.requestedAt)}
                  </p>
                </div>
                <MoneyDisplay
                  value={money(Math.round(w.netAmount * 100))}
                  className="text-sm font-medium"
                />
              </div>
            ))}
            {data.pendingWithdrawals.length > 0 && (
              <p className="text-muted-foreground text-xs">
                Total en espera:{' '}
                <MoneyDisplay
                  value={money(Math.round(totalPendingWithdrawals * 100))}
                  className="text-foreground font-medium"
                />
              </p>
            )}
          </div>
        )}
      </section>

      {/* Reportes de fraude */}
      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Reportes de fraude pendientes</h2>
          <Button render={<Link href="/admin/fraude" />} variant="ghost" size="sm">
            Ver todos
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.pendingFraudReports.length === 0 ? (
          <EmptyState icon={Flag} title="Sin reportes pendientes" />
        ) : (
          <div className="flex flex-col gap-2">
            {data.pendingFraudReports.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                href={`/admin/fraude/${r.id}`}
                className="group border-border bg-card hover:border-foreground/20 flex items-center gap-3 rounded-lg border p-4 transition-colors"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{r.campaignTitle}</p>
                  <p className="text-muted-foreground line-clamp-1 text-xs">{r.reason}</p>
                  <p className="text-muted-foreground text-xs">
                    Por {r.reporterName} · {formatShortDate(r.createdAt)}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

interface StatCardProps {
  icon: typeof ListChecks
  label: string
  value: React.ReactNode
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-4">
      <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-md">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="text-lg font-semibold">{value}</span>
      </div>
    </div>
  )
}

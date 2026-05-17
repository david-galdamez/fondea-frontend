'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Banknote, Flag, ListChecks, Megaphone } from 'lucide-react'
import type { Campaign, FraudReport, Withdrawal } from '@/types'
import { adminService, fraudService, withdrawalsService, usersService } from '@/lib/api'
import { addMoney, zeroMoney } from '@/lib/money'
import { formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { StatusBadge } from '@/components/campaigns/status-badge'

interface DashboardData {
  pendingCount: number
  openFraudCount: number
  totalUsers: number
  totalRaised: ReturnType<typeof zeroMoney>
  totalCommissions: ReturnType<typeof zeroMoney>
  recentPending: Campaign[]
  recentOpenFraud: FraudReport[]
  campaignsById: Map<string, Campaign>
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<DashboardData> {
      const [pendingPage, openFraudPage, users, allCampaigns] = await Promise.all([
        adminService.listPendingReview(1, 3),
        fraudService.listAll('open', 1, 3),
        usersService.list(),
        adminService.listAll(),
      ])
      const creatorIds = Array.from(new Set(allCampaigns.map((c) => c.creatorId)))
      const allWithdrawals = (
        await Promise.all(creatorIds.map((id) => withdrawalsService.listByCreator(id)))
      ).flat()
      const totalRaised = allCampaigns.reduce<ReturnType<typeof zeroMoney>>(
        (acc, c) => addMoney(acc, c.raised),
        zeroMoney()
      )
      const totalCommissions = allWithdrawals
        .filter((w: Withdrawal) => w.status === 'paid' || w.status === 'approved')
        .reduce<ReturnType<typeof zeroMoney>>(
          (acc, w) => addMoney(acc, w.commission),
          zeroMoney()
        )
      const campaignsById = new Map<string, Campaign>()
      allCampaigns.forEach((c) => campaignsById.set(c.id, c))

      return {
        pendingCount: pendingPage.total,
        openFraudCount: openFraudPage.total,
        totalUsers: users.length,
        totalRaised,
        totalCommissions,
        recentPending: pendingPage.items,
        recentOpenFraud: openFraudPage.items,
        campaignsById,
      }
    }

    load()
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setError(false)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [retryKey])

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <p className="text-muted-foreground py-6 text-sm">Cargando…</p>

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Panel de administración</h1>
        <p className="text-muted-foreground text-sm">
          Estado general de la plataforma y elementos que requieren atención.
        </p>
      </header>

      <section aria-label="Estadísticas" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="Pendientes de revisión"
          value={String(data.pendingCount)}
        />
        <StatCard icon={Flag} label="Reportes abiertos" value={String(data.openFraudCount)} />
        <StatCard
          icon={Banknote}
          label="Comisiones acumuladas"
          value={<MoneyDisplay value={data.totalCommissions} />}
        />
        <StatCard
          icon={Megaphone}
          label="Recaudado total"
          value={<MoneyDisplay value={data.totalRaised} />}
        />
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Pendientes de revisión</h2>
          <Button render={<Link href="/admin/validacion" />} variant="ghost" size="sm">
            Ver cola
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.recentPending.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Sin campañas en revisión"
            description="No hay nada que validar por ahora."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentPending.map((c) => (
              <Link
                key={c.id}
                href={`/admin/validacion/${c.id}`}
                className="group border-border bg-card hover:border-foreground/20 flex items-center gap-3 rounded-lg border p-4 transition-colors"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-muted-foreground text-xs">
                    Enviada el {formatShortDate(c.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
                <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Reportes de fraude abiertos</h2>
          <Button render={<Link href="/admin/fraude" />} variant="ghost" size="sm">
            Ver todos
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.recentOpenFraud.length === 0 ? (
          <EmptyState icon={Flag} title="Sin reportes abiertos" />
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentOpenFraud.map((report) => {
              const campaign = data.campaignsById.get(report.campaignId)
              return (
                <Link
                  key={report.id}
                  href={`/admin/fraude/${report.id}`}
                  className="group border-border bg-card hover:border-foreground/20 flex items-center gap-3 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium">
                      {campaign?.title ?? 'Campaña eliminada'}
                    </p>
                    <p className="text-muted-foreground line-clamp-1 text-xs">{report.details}</p>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatShortDate(report.createdAt)}
                  </span>
                  <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="border-border bg-muted/30 flex flex-col gap-1 rounded-lg border p-4 text-sm">
        <span className="text-muted-foreground">Usuarios registrados</span>
        <Link
          href="/admin/usuarios"
          className="text-lg font-semibold underline-offset-4 hover:underline"
        >
          {data.totalUsers}
        </Link>
      </section>
    </div>
  )
}

interface StatCardProps {
  icon: typeof Megaphone
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

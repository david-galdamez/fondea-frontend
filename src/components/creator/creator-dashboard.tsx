'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Banknote, CalendarClock, Megaphone, Plus, Sparkles, Users } from 'lucide-react'
import { campaignsService, withdrawalsService } from '@/lib/api'
import { addMoney, money, zeroMoney } from '@/lib/money'
import { formatShortDate } from '@/lib/dates'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { MoneyDisplay } from '@/components/common/money-display'
import { StatusBadge } from '@/components/campaigns/status-badge'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { MyCampaignDto } from '@/lib/api/campaigns.service'
import { WithdrawalDto } from '@/lib/api/withdrawals.service'

interface DashboardData {
  campaigns: MyCampaignDto[]
  withdrawals: WithdrawalDto[]
  totalRaised: ReturnType<typeof zeroMoney>
  activeCount: number
  pendingReviewCount: number
  successfulCount: number
}

export function CreatorDashboard() {
  const { session } = useSession()
  const userId = session?.user.id
  const userName = session?.user.name

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    Promise.all([campaignsService.getMine(), withdrawalsService.getMine()])
      .then(([campaigns, withdrawals]) => {
        if (cancelled) return
        const totalRaised = campaigns.reduce(
          (acc, c) => addMoney(acc, money(Math.floor(c.totalPledged * 100))),
          zeroMoney()
        )
        setData({
          campaigns,
          withdrawals,
          totalRaised,
          activeCount: campaigns.filter((c) => c.status === 'ACTIVE').length,
          pendingReviewCount: campaigns.filter((c) => c.status === 'UNDER_REVIEW').length,
          successfulCount: campaigns.filter((c) => c.status === 'SUCCESSFUL').length,
        })
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

  if (error) {
    return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  }
  if (loading || !data) {
    return <PageSkeleton variant="summary" />
  }

  const activeCampaigns = data.campaigns
    .filter((c) => c.status === 'ACTIVE')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3)

  const successfulPending = data.campaigns.filter((c) => {
    if (c.status !== 'SUCCESSFUL') return false
    const withdrawn = data.withdrawals
      .filter((w) => w.campaignId === c.id)
      .reduce((acc, w) => acc + w.grossAmount, 0)
    return withdrawn < c.totalPledged
  })

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Hola, {userName ?? 'Creador'}</h1>
        <p className="text-muted-foreground text-sm">
          Tu panel de campañas y fondos en un solo lugar.
        </p>
      </header>

      <section aria-label="Estadísticas" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Megaphone} label="Activas" value={String(data.activeCount)} />
        <StatCard icon={Sparkles} label="En revisión" value={String(data.pendingReviewCount)} />
        <StatCard icon={Users} label="Exitosas" value={String(data.successfulCount)} />
        <StatCard
          icon={Banknote}
          label="Total recaudado"
          value={<MoneyDisplay value={data.totalRaised} />}
        />
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Campañas activas</h2>
          <Button render={<Link href="/creador/campanas" />} variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {activeCampaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Aún no tienes campañas activas"
            description="Cuando una campaña sea aprobada por el equipo aparecerá aquí."
            action={
              <Button render={<Link href="/creador/campanas/nueva" />} variant="outline" size="sm">
                <Plus className="size-4" />
                Crear campaña
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {activeCampaigns.map((c) => (
              <Link
                key={c.id}
                href={`/creador/campanas/${c.id}/actualizaciones`}
                className="group border-border bg-card hover:border-foreground/20 flex flex-col gap-3 rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <CalendarClock className="size-3" aria-hidden="true" />
                      Cierra el {formatShortDate(c.deadline)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <CampaignProgress
                  raised={money(Math.floor(c.totalPledged * 100))}
                  goal={money(Math.floor(c.goalAmount * 100))}
                  backersCount={c.pledgeCount}
                  size="sm"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {successfulPending.length > 0 && (
        <section className="flex flex-col gap-3">
          <header className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Listas para retiro</h2>
            <Button render={<Link href="/creador/retiros" />} variant="ghost" size="sm">
              Ir a retiros
              <ArrowRight className="size-4" />
            </Button>
          </header>
          <div className="flex flex-col gap-2">
            {successfulPending.map((c) => (
              <div
                key={c.id}
                className="border-border bg-card flex items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-muted-foreground text-xs">
                    Recaudado{' '}
                    <MoneyDisplay
                      value={money(Math.floor(c.availableToWithdraw! * 100))}
                      className="text-foreground"
                    />
                  </p>
                </div>
                <Button render={<Link href="/creador/retiros" />} variant="outline" size="sm">
                  Solicitar retiro
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
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

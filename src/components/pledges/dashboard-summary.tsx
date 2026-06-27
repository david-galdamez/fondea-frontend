'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Bell, Compass, HandHeart, ReceiptText, Sparkles, TrendingUp } from 'lucide-react'
import type { MyPledgeDto } from '@/lib/api/pledges.service'
import type { Notification } from '@/lib/api/notifications.service'
import { certificatesService, notificationsService, pledgesService } from '@/lib/api'
import { money } from '@/lib/money'
import type { Money } from '@/types'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { NotificationItem } from '@/components/notifications/notification-item'
import { PledgeListItem } from './pledge-list-item'

const NEAR_GOAL_RATIO = 0.8

interface Stats {
  totalPledges: number
  totalAmount: Money
  certificatesCount: number
}

interface NearGoalCampaign {
  id: string
  title: string
  raised: Money
  goal: Money
}

interface SummaryData {
  recentPledges: MyPledgeDto[]
  recentNotifications: Notification[]
  nearGoal: NearGoalCampaign[]
  stats: Stats
}

export function DashboardSummary() {
  const { session } = useSession()
  const userId = session?.user.id
  const userName = session?.user.name

  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      const [pledges, notifications, certificates] = await Promise.all([
        pledgesService.getMine(),
        notificationsService.list(),
        certificatesService.listMine(),
      ])

      const activePledges = pledges.filter(
        (p) => p.status !== 'CANCELLED' && p.status !== 'REFUNDED'
      )
      const totalAmount = money(
        Math.round(activePledges.reduce((acc, p) => acc + p.amount, 0) * 100)
      )

      const nearGoalById = new Map<string, NearGoalCampaign>()
      activePledges.forEach((p) => {
        if (p.campaignGoal <= 0) return
        const ratio = p.campaignTotalPledged / p.campaignGoal
        if (ratio >= NEAR_GOAL_RATIO && ratio < 1) {
          nearGoalById.set(p.campaignId, {
            id: p.campaignId,
            title: p.campaignTitle,
            raised: money(Math.round(p.campaignTotalPledged * 100)),
            goal: money(Math.round(p.campaignGoal * 100)),
          })
        }
      })

      return {
        recentPledges: pledges.slice(0, 4),
        recentNotifications: notifications.slice(0, 5),
        nearGoal: Array.from(nearGoalById.values()),
        stats: {
          totalPledges: pledges.length,
          totalAmount,
          certificatesCount: certificates.length,
        },
      }
    }

    load()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading || !data) {
    return <PageSkeleton variant="summary" />
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hola, {userName ?? 'Patrocinador'}
        </h1>
        <p className="text-muted-foreground text-sm">
          Aquí están las campañas que apoyas y tus notificaciones recientes.
        </p>
      </header>

      <section
        aria-label="Acciones rápidas"
        className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">¿Listo para participar?</h2>
          <p className="text-muted-foreground text-sm">
            Explora el catálogo de campañas activas para apoyar, o lanza la tuya.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/explorar" />} size="sm">
            <Compass className="size-4" aria-hidden="true" />
            Explorar campañas
          </Button>
          <Button render={<Link href="/creador/campanas/nueva" />} variant="outline" size="sm">
            <Sparkles className="size-4" aria-hidden="true" />
            Crear campaña
          </Button>
        </div>
      </section>

      {data.nearGoal.length > 0 && <NearGoalAlert campaigns={data.nearGoal} />}

      <section aria-label="Estadísticas" className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={HandHeart}
          label="Promesas activas"
          value={String(data.stats.totalPledges)}
        />
        <StatCard
          icon={ReceiptText}
          label="Total apoyado"
          value={<MoneyDisplay value={data.stats.totalAmount} />}
        />
        <StatCard
          icon={ReceiptText}
          label="Certificados"
          value={String(data.stats.certificatesCount)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Mis promesas recientes</h2>
          <Button render={<Link href="/dashboard/pledges" />} variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.recentPledges.length === 0 ? (
          <EmptyState
            icon={HandHeart}
            title="Aún no apoyas ninguna campaña"
            description="Explora campañas activas y promete tu primer apoyo."
            action={
              <Button render={<Link href="/explorar" />} variant="outline" size="sm">
                Explorar campañas
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentPledges.map((p) => (
              <PledgeListItem key={p.id} pledge={p} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Notificaciones recientes</h2>
          <Button render={<Link href="/dashboard/notificaciones" />} variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </header>
        {data.recentNotifications.length === 0 ? (
          <EmptyState icon={Bell} title="Sin notificaciones por ahora" />
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentNotifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

interface StatCardProps {
  icon: typeof HandHeart
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

interface NearGoalAlertProps {
  campaigns: NearGoalCampaign[]
}

function NearGoalAlert({ campaigns }: NearGoalAlertProps) {
  return (
    <section
      aria-label="Campañas cerca de su meta"
      className="border-primary/30 bg-primary/5 flex flex-col gap-3 rounded-lg border p-4"
    >
      <header className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-full"
        >
          <TrendingUp className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="text-sm font-semibold">
            {campaigns.length === 1
              ? 'Una campaña que apoyas está cerca de su meta'
              : `${campaigns.length} campañas que apoyas están cerca de su meta`}
          </h2>
          <p className="text-muted-foreground text-xs">
            Cuando alcancen el 100%, tu promesa se cobrará automáticamente.
          </p>
        </div>
      </header>
      <ul className="flex flex-col gap-2">
        {campaigns.slice(0, 3).map((c) => (
          <li key={c.id}>
            <Link
              href={`/campanas/${c.id}`}
              className="border-border bg-background hover:border-foreground/20 flex flex-col gap-2 rounded-md border p-3 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-sm font-medium">{c.title}</span>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </div>
              <CampaignProgress raised={c.raised} goal={c.goal} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

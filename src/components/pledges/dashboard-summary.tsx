'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Bell, HandHeart, ReceiptText, TrendingUp } from 'lucide-react'
import type { Campaign, CampaignSummary, Notification, Pledge } from '@/types'
import {
  campaignsService,
  certificatesService,
  notificationsService,
  pledgesService,
} from '@/lib/api'
import { addMoney, zeroMoney } from '@/lib/money'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { NotificationItem } from '@/components/notifications/notification-item'
import { PledgeListItem } from './pledge-list-item'

interface Stats {
  totalPledges: number
  totalAmount: ReturnType<typeof zeroMoney>
  certificatesCount: number
}

interface SummaryData {
  recentPledges: Pledge[]
  recentNotifications: Notification[]
  campaignsById: Map<string, Campaign>
  nearGoal: CampaignSummary[]
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
      const [allPledges, notifications, certificates, nearGoalAll] = await Promise.all([
        pledgesService.listByBacker(userId!, 1, 100),
        notificationsService.listForUser(userId!, { pageSize: 5 }),
        certificatesService.listForBacker(userId!),
        campaignsService.getNearGoal(),
      ])
      const campaignIds = Array.from(new Set(allPledges.items.map((p) => p.campaignId)))
      const campaigns = await Promise.all(
        campaignIds.map((id) => campaignsService.getById(id).catch(() => null))
      )
      const campaignsById = new Map<string, Campaign>()
      campaigns.forEach((c) => {
        if (c) campaignsById.set(c.id, c)
      })
      const totalAmount = allPledges.items
        .filter((p) => p.status !== 'cancelled' && p.status !== 'refunded')
        .reduce((acc, p) => addMoney(acc, p.amount), zeroMoney())

      const supportedCampaignIds = new Set(
        allPledges.items
          .filter((p) => p.status !== 'cancelled' && p.status !== 'refunded')
          .map((p) => p.campaignId)
      )
      const nearGoal = nearGoalAll.filter((c) => supportedCampaignIds.has(c.id))

      return {
        recentPledges: allPledges.items.slice(0, 4),
        recentNotifications: notifications.items,
        campaignsById,
        nearGoal,
        stats: {
          totalPledges: allPledges.total,
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
              <PledgeListItem
                key={p.id}
                pledge={p}
                campaign={data.campaignsById.get(p.campaignId) ?? null}
              />
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
  campaigns: CampaignSummary[]
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
              href={`/campanas/${c.slug}`}
              className="border-border bg-background hover:border-foreground/20 flex flex-col gap-2 rounded-md border p-3 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-sm font-medium">{c.title}</span>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </div>
              <CampaignProgress raised={c.raised} goal={c.goal} backersCount={c.backersCount} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

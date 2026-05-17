'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import type { Campaign, Pledge, User } from '@/types'
import { campaignsService, pledgesService, usersService } from '@/lib/api'
import { addMoney, zeroMoney } from '@/lib/money'
import { formatShortDate } from '@/lib/dates'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PledgeStatusBadge } from '@/components/pledges/pledge-status-badge'

interface BackersListProps {
  campaignId: string
}

interface Data {
  campaign: Campaign
  pledges: Pledge[]
  backersById: Map<string, User>
}

export function BackersList({ campaignId }: BackersListProps) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [campaign, paginatedPledges] = await Promise.all([
        campaignsService.getById(campaignId),
        pledgesService.listByCampaign(campaignId, 1, 200),
      ])
      const nonAnonIds = Array.from(
        new Set(paginatedPledges.items.filter((p) => !p.isAnonymous).map((p) => p.backerId))
      )
      const users = await Promise.all(
        nonAnonIds.map((id) => usersService.getById(id).catch(() => null))
      )
      const backersById = new Map<string, User>()
      users.forEach((u) => {
        if (u) backersById.set(u.id, u)
      })
      return { campaign, pledges: paginatedPledges.items, backersById }
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
  }, [campaignId, retryKey])

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="list" />

  const activePledges = data.pledges.filter(
    (p) => p.status === 'authorized' || p.status === 'charged'
  )
  const totalAmount = activePledges.reduce((acc, p) => addMoney(acc, p.amount), zeroMoney())
  const anonymousCount = activePledges.filter((p) => p.isAnonymous).length

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs">{data.campaign.title}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Patrocinadores</h1>
        <p className="text-muted-foreground text-sm">
          {activePledges.length} apoyos activos por <MoneyDisplay value={totalAmount} />
          {anonymousCount > 0 && ` · ${anonymousCount} anónimos`}
        </p>
      </header>

      {data.pledges.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no tienes patrocinadores"
          description="Cuando alguien apoye tu campaña aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.pledges.map((p) => {
            const backer = p.isAnonymous ? null : (data.backersById.get(p.backerId) ?? null)
            return (
              <div
                key={p.id}
                className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">
                    {p.isAnonymous ? 'Apoyo anónimo' : (backer?.name ?? 'Usuario eliminado')}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatShortDate(p.createdAt)}
                    {!p.isAnonymous && backer?.location?.country && (
                      <> · {backer.location.country}</>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <MoneyDisplay value={p.amount} className="text-sm font-medium" />
                  <PledgeStatusBadge status={p.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

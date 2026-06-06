'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { campaignsService, pledgesService } from '@/lib/api'
import { formatShortDate } from '@/lib/dates'
import { money } from '@/lib/money'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PledgeStatusBadge } from '@/components/pledges/pledge-status-badge'
import type { CampaignDetailDto } from '@/lib/api/campaigns.service'
import type { CampaignPledgeDto, PageableResponse } from '@/lib/api/pledges.service'

interface BackersListProps {
  campaignId: string
}

interface Data {
  campaign: CampaignDetailDto
  pledges: PageableResponse<CampaignPledgeDto>
}

export function BackersList({ campaignId }: BackersListProps) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      campaignsService.getById(campaignId),
      pledgesService.listByCampaign(campaignId, 1, 200),
    ])
      .then(([campaign, pledges]) => {
        if (cancelled) return
        setData({ campaign, pledges })
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [campaignId, retryKey])

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="list" />

  const pledges = data.pledges.content
  const totalAmount = pledges.reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs">{data.campaign.title}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Patrocinadores</h1>
        <p className="text-muted-foreground text-sm">
          {pledges.length} apoyos activos por{' '}
          <MoneyDisplay value={money(Math.round(totalAmount * 100))} />
        </p>
      </header>

      {pledges.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no tienes patrocinadores"
          description="Cuando alguien apoye tu campaña aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {pledges.map((p) => (
            <div
              key={p.id}
              className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-medium">{p.sponsorName}</p>
                <p className="text-muted-foreground text-xs">{formatShortDate(p.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <MoneyDisplay value={money(Math.round(p.amount * 100))} className="text-sm font-medium" />
                <PledgeStatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

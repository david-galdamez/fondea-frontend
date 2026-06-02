'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { campaignsService, rewardsService } from '@/lib/api'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { CampaignWizard } from './wizard/campaign-wizard'
import type { CampaignDetailDto } from '@/lib/api/campaigns.service'
import type { RewardDetailDto } from '@/lib/api/rewards.service'
import type { WizardFields, WizardRewardDraft } from './wizard/types'
import { computeCloseDate } from './wizard/step-goal'

interface EditCampaignClientProps {
  campaignId: string
}

function toWizardFields(c: CampaignDetailDto): WizardFields {
  const durationDays = c.daysLeft > 0 ? c.daysLeft : 30
  return {
    title: c.title,
    description: c.description,
    categoryId: c.categoryId,
    locationId: c.locationId,
    city: c.city ?? "",
    isFlexibleGoal: c.isFlexibleGoal,
    goalAmount: String(c.goalAmount),
    durationDays,
    deadline: computeCloseDate(durationDays),
  }
}

function toWizardReward(r: RewardDetailDto): WizardRewardDraft {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    minAmount: String(r.minAmount),
    estimatedDelivery: r.estimatedDelivery ?? '',
    stock: r.stockOriginal != null ? String(r.stockOriginal) : '',
  }
}

export function EditCampaignClient({ campaignId }: EditCampaignClientProps) {
  const searchParams = useSearchParams()
  const stepParam = Number(searchParams.get('step') ?? '1')

  const [data, setData] = useState<{ campaign: CampaignDetailDto; rewards: RewardDetailDto[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      campaignsService.getById(campaignId),
      rewardsService.getManage(campaignId),
    ])
      .then(([campaign, rewards]) => {
        if (cancelled) return
        setData({ campaign, rewards })
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
  if (loading || !data) return <PageSkeleton variant="form" />

  return (
    <CampaignWizard
      initialStep={stepParam}
      initial={{
        campaignId,
        status: data.campaign.status,
        fields: toWizardFields(data.campaign),
        rewards: data.rewards.map(toWizardReward),
      }}
    />
  )
}

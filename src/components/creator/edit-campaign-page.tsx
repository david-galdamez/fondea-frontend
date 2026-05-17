'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Campaign, FAQ, Reward } from '@/types'
import { campaignsService, faqsService, rewardsService } from '@/lib/api'
import { ErrorState } from '@/components/common/error-state'
import { CampaignWizard } from './wizard/campaign-wizard'

interface EditCampaignClientProps {
  campaignId: string
}

interface InitialData {
  campaign: Campaign
  rewards: Reward[]
  faqs: FAQ[]
}

export function EditCampaignClient({ campaignId }: EditCampaignClientProps) {
  const searchParams = useSearchParams()
  const stepParam = Number(searchParams.get('step') ?? '1')

  const [data, setData] = useState<InitialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      campaignsService.getById(campaignId),
      rewardsService.listByCampaign(campaignId),
      faqsService.listByCampaign(campaignId),
    ])
      .then(([campaign, rewards, faqs]) => {
        if (cancelled) return
        setData({ campaign, rewards, faqs })
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
  if (loading || !data) return <p className="text-muted-foreground py-6 text-sm">Cargando…</p>

  return <CampaignWizard initial={data} initialStep={stepParam} />
}

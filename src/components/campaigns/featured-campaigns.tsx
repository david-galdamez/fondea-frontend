'use client'

import { useEffect, useState } from 'react'
import type { CampaignSummary } from '@/types'
import { campaignsService } from '@/lib/api'
import { CampaignCard } from './campaign-card'
import { CampaignCardSkeleton } from './campaign-card-skeleton'

interface FeaturedCampaignsProps {
  limit?: number
}

export function FeaturedCampaigns({ limit = 6 }: FeaturedCampaignsProps) {
  const [items, setItems] = useState<CampaignSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    campaignsService
      .getFeatured(limit)
      .then((res) => {
        if (!cancelled) setItems(res)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  if (error) {
    return (
      <p className="text-muted-foreground text-sm">No pudimos cargar las campañas destacadas.</p>
    )
  }

  if (items === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aún no hay campañas destacadas. Vuelve pronto.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}

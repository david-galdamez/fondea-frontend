import { Suspense } from 'react'
import { EditCampaignClient } from '@/components/creator/edit-campaign-page'
import { PageSkeleton } from '@/components/common/page-skeleton'

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<PageSkeleton variant="form" />}>
      <EditCampaignClient campaignId={id} />
    </Suspense>
  )
}

import { Suspense } from 'react'
import { EditCampaignClient } from '@/components/creator/edit-campaign-page'

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<p className="text-muted-foreground py-6 text-sm">Cargando…</p>}>
      <EditCampaignClient campaignId={id} />
    </Suspense>
  )
}

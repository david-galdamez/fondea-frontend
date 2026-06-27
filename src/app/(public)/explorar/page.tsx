import { Suspense } from 'react'
import { ExploreClient } from '@/components/campaigns/explore-client'

export default function ExplorarPage() {
  return (
    <Suspense fallback={null}>
      <ExploreClient />
    </Suspense>
  )
}

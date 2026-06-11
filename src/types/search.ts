import type { ID } from './common'
import type { CampaignStatus } from '@/lib/api/campaigns.service'

export type GoalType = 'fixed' | 'flexible'

export type SortBy = 'recent' | 'ending_soon' | 'most_funded' | 'most_backers' | 'featured'

export interface SearchFilters {
  query?: string
  categoryId?: ID
  city?: string
  country?: string
  status?: CampaignStatus[]
  goalType?: GoalType
  sortBy?: SortBy
  page?: number
  pageSize?: number
}

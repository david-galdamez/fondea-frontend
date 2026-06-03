import { api } from "../client";

export type CampaignStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'SUCCESSFUL'
  | 'FAILED'

export interface CampaignCreatedDto {
  id: string
  title: string
  status: CampaignStatus
  createdAt: string
}

export interface CampaignSummaryDto {
  id: string
  title: string
  creatorName: string
  goalAmount: number
  totalPledged: number
  pledgeCount: number
  deadline: string        // LocalDate → "YYYY-MM-DD"
  categoryName: string
  locationCity: string
  status: CampaignStatus
  featuredScore: number | null
}

export interface RewardSummaryDto {
  id: string
  title: string
  description: string
  minAmount: number
  estimatedDelivery?: string
  stock?: number
}

export interface FaqDto {
  question: string
  answer: string
}

export interface CampaignDetailDto {
  id: string
  title: string
  description: string
  creatorName: string
  creatorId: string
  goalAmount: number
  totalPledged: number
  pledgeCount: number
  daysLeft: number
  deadline: string
  isFlexibleGoal: boolean
  status: CampaignStatus
  categoryId: string
  locationId: string
  city: string
  rewards: RewardSummaryDto[]
  faqs: FaqDto[]
}

export interface MyCampaignDto {
  id: string
  title: string
  goalAmount: number
  totalPledged: number
  pledgeCount: number
  deadline: string
  status: CampaignStatus
  daysLeft: number
  availableToWithdraw: number | null
}

export interface CampaignDraftDto {
  id: string
  title: string
  goalAmount: number
  deadline: string
  createdAt: string
}

export interface CampaignSearchParams {
  categoryId?: string
  locationId?: string
  keyword?: string
}

export interface RegisterCampaignRequest {
  title: string
  description: string
  goalAmount: number
  isFlexibleGoal: boolean
  deadline: string        // "YYYY-MM-DD"
  categoryId: string
  locationId: string
  city: string
}

export const campaignsService = {
  create(data: RegisterCampaignRequest): Promise<CampaignCreatedDto> {
    return api.post<CampaignCreatedDto>('/api/campaigns', data)
  },

  search(params: CampaignSearchParams = {}): Promise<CampaignSummaryDto[]> {
    const query = new URLSearchParams()
    if (params.categoryId) query.set('categoryId', params.categoryId)
    if (params.locationId) query.set('locationId', params.locationId)
    if (params.keyword) query.set('keyword', params.keyword)
    const qs = query.toString()
    return api.get<CampaignSummaryDto[]>(`/api/campaigns/search${qs ? `?${qs}` : ''}`)
  },

  getFeatured(): Promise<CampaignSummaryDto[]> {
    return api.get<CampaignSummaryDto[]>('/api/campaigns/featured')
  },

  getMine(): Promise<MyCampaignDto[]> {
    return api.get<MyCampaignDto[]>('/api/campaigns/mine')
  },

  getDrafts(): Promise<CampaignDraftDto[]> {
    return api.get<CampaignDraftDto[]>('/api/campaigns/drafts')
  },

  getById(id: string): Promise<CampaignDetailDto> {
    return api.get<CampaignDetailDto>(`/api/campaigns/${id}`)
  },

  update(id: string, data: RegisterCampaignRequest): Promise<CampaignCreatedDto> {
    return api.put<CampaignCreatedDto>(`/api/campaigns/${id}`, data)
  },

  submitForReview(id: string): Promise<void> {
    return api.post<void>(`/api/campaigns/${id}/submit`, {})
  },
}

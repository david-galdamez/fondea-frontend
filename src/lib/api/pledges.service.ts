import { api } from '../client'

export type PledgeStatus =
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PENDING'

export interface PledgeCreatedDto {
  id: string
  campaignTitle: string
  rewardTitle: string | null
  amount: number
  status: PledgeStatus
  createdAt: string
}

export interface MyPledgeDto {
  id: string
  campaignId: string
  campaignTitle: string
  creatorName: string
  rewardTitle: string | null
  amount: number
  status: PledgeStatus
  createdAt: string
  campaignGoal: number
  campaignTotalPledged: number
  campaignDeadline: string
}

export interface CampaignPledgeDto {
  id: string
  sponsorId: string
  sponsorName: string
  amount: number
  status: PledgeStatus
  createdAt: string
}

export interface PageableResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface CreatePledgeRequest {
  campaignId: string
  rewardId?: string
  amount: number
}

export const pledgesService = {
  create(data: CreatePledgeRequest): Promise<PledgeCreatedDto> {
    return api.post<PledgeCreatedDto>('/api/pledges', data)
  },

  getMine(): Promise<MyPledgeDto[]> {
    return api.get<MyPledgeDto[]>('/api/pledges/mine')
  },

  listByCampaign(
    campaignId: string,
    page = 1,
    size = 20,
  ): Promise<PageableResponse<CampaignPledgeDto>> {
    return api.get<PageableResponse<CampaignPledgeDto>>(
      `/api/campaigns/${campaignId}/pledges?page=${page}&size=${size}`,
    )
  },
}

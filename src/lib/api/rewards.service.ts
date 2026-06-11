import { api } from "../client";

export interface RewardCreatedDto {
  id: string
  title: string
  minAmount: number
  stock: number | null
  estimatedDelivery: string | null // "YYYY-MM-DD"
}

export interface RewardSummaryDto {
  id: string
  title: string
  description: string
  minAmount: number
  stock?: number
  estimatedDelivery?: string
}

export interface RewardDetailDto {
  id: string
  title: string
  description: string
  minAmount: number
  stockOriginal: number | null
  stockRemaining: number | null
  pledgeCount: number
  estimatedDelivery: string | null
}

export interface CreateRewardRequest {
  title: string
  description?: string
  minAmount: number
  stock?: number
  estimatedDelivery?: string // "YYYY-MM-DD"
}

export const rewardsService = {
  create(campaignId: string, data: CreateRewardRequest): Promise<RewardCreatedDto> {
    return api.post<RewardCreatedDto>(`/api/campaigns/${campaignId}/rewards`, data)
  },

  getAvailable(campaignId: string): Promise<RewardSummaryDto[]> {
    return api.get<RewardSummaryDto[]>(`/api/campaigns/${campaignId}/rewards`)
  },

  getManage(campaignId: string): Promise<RewardDetailDto[]> {
    return api.get<RewardDetailDto[]>(`/api/campaigns/${campaignId}/rewards/manage`)
  },

  remove(campaignId: string, rewardId: string): Promise<void> {
    return api.delete<void>(`/api/campaigns/${campaignId}/rewards/${rewardId}`)
  },
}

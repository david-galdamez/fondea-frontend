import { api } from '../client'

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface WithdrawalCreatedDto {
  id: string
  grossAmount: number
  commissionAmount: number
  netAmount: number
  status: WithdrawalStatus
  requestAt: string
}

export interface WithdrawalDto {
  id: string
  campaignId: string
  campaignTitle: string
  grossAmount: number
  commissionAmount: number
  netAmount: number
  status: WithdrawalStatus
  requestedAt: string
  paidAt: string | null
}

export interface WithdrawalLimitsDto {
  isNewCreator: boolean
  dailyLimit: number
  usedToday: number
  availableToday: number
}

export interface CreateWithdrawalRequest {
  campaignId: string
  grossAmount: number // BigDecimal en dólares, ej: 25.00
}

export const withdrawalsService = {
  request(data: CreateWithdrawalRequest): Promise<WithdrawalCreatedDto> {
    return api.post<WithdrawalCreatedDto>('/api/withdrawals', data)
  },

  getMine(): Promise<WithdrawalDto[]> {
    return api.get<WithdrawalDto[]>('/api/withdrawals/mine')
  },

  getLimits(): Promise<WithdrawalLimitsDto> {
    return api.get<WithdrawalLimitsDto>('/api/withdrawals/limits')
  },
}

import type { ID, ISODateString, Money } from './common'

export type WithdrawalStatus = 'requested' | 'approved' | 'paid' | 'rejected'

export interface Withdrawal {
  id: ID
  creatorId: ID
  campaignId: ID
  gross: Money
  commission: Money
  net: Money
  status: WithdrawalStatus
  rejectionReason?: string
  requestedAt: ISODateString
  paidAt?: ISODateString
}

export interface WithdrawalLimit {
  dailyMax: Money
  usedToday: Money
  isNewCreator: boolean
}

import type { ID, ISODateString, Money } from './common'

export type PledgeStatus =
  | 'pending'
  | 'authorized'
  | 'charged'
  | 'refunded'
  | 'failed'
  | 'cancelled'

export interface Pledge {
  id: ID
  campaignId: ID
  backerId: ID
  rewardId?: ID
  amount: Money
  status: PledgeStatus
  isAnonymous: boolean
  wantsCertificate: boolean
  createdAt: ISODateString
  chargedAt?: ISODateString
  refundedAt?: ISODateString
}

export interface CreatePledgeInput {
  campaignId: ID
  amount: Money
  rewardId?: ID
  isAnonymous?: boolean
  wantsCertificate?: boolean
}

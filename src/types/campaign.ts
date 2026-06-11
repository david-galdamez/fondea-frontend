import type { ID, ISODateString, Money } from './common'

export type CampaignStatus = string

export interface Campaign {
  id: ID
  slug: string
  title: string
  summary: string
  description: string
  categoryId: ID
  location: { city: string; country: string }
  tags: string[]
  goal: Money
  raised: Money
  goalType: 'fixed' | 'flexible'
  backersCount: number
  startDate: ISODateString
  endDate: ISODateString
  durationDays: number
  status: CampaignStatus
  featured: boolean
  coverImageUrl: string
  gallery: string[]
  creatorId: ID
  createdAt: ISODateString
  updatedAt: ISODateString
  approvedAt?: ISODateString
}

export interface CampaignSummary {
  id: ID
  slug: string
  title: string
  summary: string
  creatorName: string
  goal: Money
  raised: Money
  backersCount: number
  endDate: ISODateString
  status: CampaignStatus
  featured: boolean
  coverImageUrl: string
  creatorId: ID
  categoryName: string
  location: string
}

export interface Pledge {
  id: ID
  campaignId: ID
  backerId: ID
  rewardId?: ID
  amount: Money
  status: string
  isAnonymous: boolean
  wantsCertificate: boolean
  createdAt: ISODateString
  chargedAt?: ISODateString
  refundedAt?: ISODateString
}

export interface Withdrawal {
  id: ID
  campaignId: ID
  creatorId: ID
  amount: Money
  status: string
  requestedAt: ISODateString
  processedAt?: ISODateString
}

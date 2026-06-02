import type { ISODateString, Money } from './common'

export type CampaignStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'SUCCESSFUL'
  | 'FAILED'

export interface Category {
  id: string
  name: string
}

export interface Location {
  id: string
  city: string
  country: string
}

export interface Campaign {
  id: string
  title: string
  description: string
  categoryId: string
  locationId: string
  city: string
  goal: Money
  raised: Money
  isFlexibleGoal: boolean
  backersCount: number
  startDate: ISODateString
  endDate: ISODateString
  durationDays: number
  status: CampaignStatus
  featured: boolean
  rejectionReason?: string
  coverImageUrl?: string
  gallery: string[]
  videoUrl?: string
  creatorId: string
  createdAt: ISODateString
  updatedAt: ISODateString
  approvedAt?: ISODateString
}

export type CampaignDraft = Pick<
  Campaign,
  | 'title'
  | 'description'
  | 'categoryId'
  | 'locationId'
  | 'city'
  | 'goal'
  | 'isFlexibleGoal'
  | 'durationDays'
  | 'coverImageUrl'
  | 'gallery'
  | 'videoUrl'
>

export type CampaignSummary = Pick<
  Campaign,
  | 'id'
  | 'title'
  | 'description'
  | 'coverImageUrl'
  | 'goal'
  | 'raised'
  | 'isFlexibleGoal'
  | 'backersCount'
  | 'endDate'
  | 'status'
  | 'featured'
  | 'categoryId'
  | 'locationId'
  | 'creatorId'
>

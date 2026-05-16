import type { ID, ISODateString, Money } from './common'
import type { Location } from './user'

export type GoalType = 'fixed' | 'flexible'

export type CampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'rejected'
  | 'approved'
  | 'active'
  | 'successful'
  | 'failed'
  | 'cancelled'

export interface Category {
  id: ID
  slug: string
  name: string
  icon?: string
}

export interface Campaign {
  id: ID
  slug: string
  title: string
  summary: string
  description: string
  categoryId: ID
  location: Location
  tags: string[]
  goal: Money
  raised: Money
  goalType: GoalType
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
  creatorId: ID
  createdAt: ISODateString
  updatedAt: ISODateString
  approvedAt?: ISODateString
}

export type CampaignDraft = Pick<
  Campaign,
  | 'title'
  | 'summary'
  | 'description'
  | 'categoryId'
  | 'location'
  | 'tags'
  | 'goal'
  | 'goalType'
  | 'durationDays'
  | 'coverImageUrl'
  | 'gallery'
  | 'videoUrl'
>

export type CampaignSummary = Pick<
  Campaign,
  | 'id'
  | 'slug'
  | 'title'
  | 'summary'
  | 'coverImageUrl'
  | 'goal'
  | 'raised'
  | 'goalType'
  | 'backersCount'
  | 'endDate'
  | 'status'
  | 'featured'
  | 'categoryId'
  | 'location'
  | 'creatorId'
>

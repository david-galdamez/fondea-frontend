import type { ID, ISODateString } from './common'

export type UpdateVisibility = 'public' | 'backers_only'

export interface CampaignUpdate {
  id: ID
  campaignId: ID
  title: string
  body: string
  visibility: UpdateVisibility
  publishedAt: ISODateString
}

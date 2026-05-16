import type { ID } from './common'

export interface FAQ {
  id: ID
  campaignId: ID
  question: string
  answer: string
  order: number
}

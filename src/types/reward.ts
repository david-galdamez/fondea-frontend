import type { ID, ISODateString, Money } from './common'

export interface Reward {
  id: ID
  campaignId: ID
  title: string
  description: string
  minAmount: Money
  estimatedDelivery?: ISODateString
  stock?: number
  claimed: number
  shippingRegions?: string[]
  order: number
}

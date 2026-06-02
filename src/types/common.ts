
export type ISODateString = string

export type Currency = 'USD'

export interface Money {
  amount: number
  currency: Currency
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

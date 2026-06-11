
export type ISODateString = string

export type Currency = 'USD'

export type ID = string

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

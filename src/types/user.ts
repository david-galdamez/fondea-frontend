import type { ID, ISODateString, Money } from './common'

export type Role = 'admin' | 'creator' | 'backer'

export interface Location {
  city: string
  country: string
}

export interface User {
  id: ID
  email: string
  name: string
  avatarUrl?: string
  roles: Role[]
  location?: Location
  bio?: string
  verifiedAt?: ISODateString
  isNewCreator?: boolean
  totalRaised?: Money
  campaignsCount?: number
  pledgesCount?: number
  totalPledged?: Money
  createdAt: ISODateString
}

export interface Session {
  user: User
  token: string
  expiresAt: ISODateString
}

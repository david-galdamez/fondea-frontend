import type { ISODateString } from './common'

export type Role = 'ADMIN' | 'CREATOR' | 'SPONSOR'

export interface Location {
  city: string
  country: string
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
  city?: string
  country?: string
  bio?: string
  isNewCreator?: boolean
  isVerified: boolean
}

export interface Session {
  user: User
  token: string
  expiresAt: ISODateString
}

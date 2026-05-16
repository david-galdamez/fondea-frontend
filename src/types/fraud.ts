import type { ID, ISODateString } from './common'

export type FraudReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed'

export type FraudReason =
  | 'misleading_info'
  | 'identity_theft'
  | 'inappropriate_content'
  | 'spam'
  | 'other'

export interface FraudReport {
  id: ID
  campaignId: ID
  reporterId: ID
  reason: FraudReason
  details: string
  status: FraudReportStatus
  resolutionNotes?: string
  createdAt: ISODateString
  resolvedAt?: ISODateString
}

export interface CreateFraudReportInput {
  campaignId: ID
  reason: FraudReason
  details: string
}

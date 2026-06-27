import type { ID, ISODateString } from './common'

export type NotificationType =
  | 'NEAR_GOAL'
  | 'CAMPAIGN_ENDED'
  | 'CAMPAIGN_APPROVED'
  | 'CAMPAIGN_REJECTED'
  | 'PLEDGE_CHARGED'
  | 'PLEDGE_REFUNDED'
  | 'NEW_UPDATE'
  | 'FRAUD_REPORT_RESOLVED'
  | 'FRAUD_REPORT_DISMISSED'

export type NotificationEntityType = 'campaign' | 'pledge' | 'fraud_report'

export interface NotificationEntityRef {
  type: NotificationEntityType
  id: ID
}

export interface Notification {
  id: ID
  userId: ID
  type: NotificationType
  title: string
  body: string
  entityRef: NotificationEntityRef
  read: boolean
  createdAt: ISODateString
}

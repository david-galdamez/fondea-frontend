import type { ID, ISODateString } from './common'

export type NotificationType =
  | 'campaign_near_goal'
  | 'campaign_approved'
  | 'campaign_rejected'
  | 'campaign_successful'
  | 'campaign_failed'
  | 'pledge_charged'
  | 'pledge_refunded'
  | 'new_update'
  | 'fraud_report_update'

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

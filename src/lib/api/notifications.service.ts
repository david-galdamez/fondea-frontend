import { api } from '../client';

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

export interface Notification {
  id: string
  campaignId: string | null
  campaignTitle: string | null
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
}

export interface ListNotificationsOptions {
  unreadOnly?: boolean
}

interface NotificationDto {
  id: string
  campaignId: string | null
  campaignTitle: string | null
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

function mapNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    campaignId: dto.campaignId,
    campaignTitle: dto.campaignTitle,
    type: dto.type as NotificationType,
    message: dto.message,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
  }
}

export const notificationsService = {
  async list(options: ListNotificationsOptions = {}): Promise<Notification[]> {
    const path = options.unreadOnly ? '/api/notifications/unread' : '/api/notifications'
    const data = await api.get<NotificationDto[]>(path)
    return data.map(mapNotification)
  },

  async countUnread(): Promise<number> {
    const items = await api.get<NotificationDto[]>('/api/notifications/unread')
    return items.length
  },

  async markAllRead(): Promise<void> {
    await api.put<void>('/api/notifications/read-all', {})
  },
}

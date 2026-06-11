'use client'

import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  Circle,
  Flag,
  Megaphone,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Notification, NotificationType } from '@/lib/api/notifications.service'
import { formatShortDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: Notification
  onMarkRead?: (id: string) => void
}

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  NEAR_GOAL: TrendingUp,
  CAMPAIGN_ENDED: CheckCircle2,
  CAMPAIGN_APPROVED: Sparkles,
  CAMPAIGN_REJECTED: XCircle,
  PLEDGE_CHARGED: CheckCircle2,
  PLEDGE_REFUNDED: Bell,
  NEW_UPDATE: Megaphone,
  FRAUD_REPORT_RESOLVED: Flag,
  FRAUD_REPORT_DISMISSED: XCircle,
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = TYPE_ICON[notification.type] ?? Bell
  const href = notification.campaignId ? `/campanas/${notification.campaignId}` : '#'

  function handleClick() {
    if (!notification.isRead) onMarkRead?.(notification.id)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'border-border bg-card hover:border-foreground/20 flex items-start gap-3 rounded-lg border p-4 transition-colors',
        !notification.isRead && 'border-l-primary border-l-2'
      )}
    >
      <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{notification.message}</p>
          {!notification.isRead && (
            <Circle
              className="fill-primary text-primary mt-1.5 size-2 shrink-0"
              aria-label="No leída"
            />
          )}
        </div>
        <p className="text-muted-foreground text-xs">{formatShortDate(notification.createdAt)}</p>
      </div>
    </Link>
  )
}

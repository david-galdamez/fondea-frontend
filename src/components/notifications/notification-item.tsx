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
import type { Notification, NotificationType } from '@/types'
import { formatShortDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: Notification
  onMarkRead?: (id: string) => void
}

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  campaign_near_goal: TrendingUp,
  campaign_approved: Sparkles,
  campaign_rejected: XCircle,
  campaign_successful: CheckCircle2,
  campaign_failed: XCircle,
  pledge_charged: CheckCircle2,
  pledge_refunded: Bell,
  new_update: Megaphone,
  fraud_report_update: Flag,
}

function entityHref(notification: Notification): string {
  const { entityRef } = notification
  if (entityRef.type === 'campaign') return `/campanas/${entityRef.id}`
  if (entityRef.type === 'pledge') return `/dashboard/pledges/${entityRef.id}`
  if (entityRef.type === 'fraud_report') return `/dashboard/notificaciones`
  return '#'
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = TYPE_ICON[notification.type] ?? Bell
  const href = entityHref(notification)

  function handleClick() {
    if (!notification.read) onMarkRead?.(notification.id)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'border-border bg-card hover:border-foreground/20 flex items-start gap-3 rounded-lg border p-4 transition-colors',
        !notification.read && 'border-l-primary border-l-2'
      )}
    >
      <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{notification.title}</p>
          {!notification.read && (
            <Circle
              className="fill-primary text-primary mt-1.5 size-2 shrink-0"
              aria-label="No leída"
            />
          )}
        </div>
        <p className="text-muted-foreground text-sm">{notification.body}</p>
        <p className="text-muted-foreground text-xs">{formatShortDate(notification.createdAt)}</p>
      </div>
    </Link>
  )
}

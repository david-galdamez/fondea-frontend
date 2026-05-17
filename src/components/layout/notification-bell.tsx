'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NotificationBellProps {
  unreadCount?: number
}

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  const hasUnread = unreadCount > 0
  const label = hasUnread ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'

  return (
    <Button
      render={<Link href="/dashboard/notificaciones" />}
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      className="relative"
    >
      <Bell className="size-4" aria-hidden="true" />
      {hasUnread && (
        <span
          aria-hidden="true"
          className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
}

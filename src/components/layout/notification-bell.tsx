'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import type { Notification } from '@/types'
import { notificationsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationItem } from '@/components/notifications/notification-item'

interface NotificationBellProps {
  userId?: string
  unreadCount?: number
  onChange?: () => void
}

const PREVIEW_LIMIT = 5

export function NotificationBell({ userId, unreadCount = 0, onChange }: NotificationBellProps) {
  const hasUnread = unreadCount > 0
  const label = hasUnread ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'

  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)

  async function loadItems() {
    if (!userId) return
    setLoading(true)
    try {
      const page = await notificationsService.listForUser(userId, {
        page: 1,
        pageSize: PREVIEW_LIMIT,
      })
      setItems(page.items)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) void loadItems()
  }

  async function markRead(id: string) {
    try {
      await notificationsService.markRead(id)
      setItems((prev) => (prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev))
      onChange?.()
    } catch {
      // silent — passive bell click should not toast
    }
  }

  async function markAllRead() {
    if (!userId || marking) return
    setMarking(true)
    try {
      await notificationsService.markAllRead(userId)
      setItems((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev))
      onChange?.()
    } finally {
      setMarking(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={label} className="relative">
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
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-1.5rem))] p-0">
        <div className="border-border flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-medium">Notificaciones</p>
          {hasUnread && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              disabled={marking}
              className="h-7 px-2 text-xs"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Marcar todas
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && !items ? (
            <div className="flex flex-col gap-2 px-1 py-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted h-14 w-full animate-pulse rounded-md" />
              ))}
            </div>
          ) : !items || items.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              <Bell className="text-muted-foreground size-5" aria-hidden="true" />
              <p className="text-sm font-medium">Sin notificaciones</p>
              <p className="text-muted-foreground text-xs">
                Te avisaremos aquí cuando ocurra algo relevante.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((n) => (
                <li key={n.id}>
                  <NotificationItem notification={n} onMarkRead={markRead} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border border-t px-3 py-2">
          <Link
            href="/dashboard/notificaciones"
            className="text-muted-foreground hover:text-foreground block text-center text-xs"
            onClick={() => setOpen(false)}
          >
            Ver todas las notificaciones
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

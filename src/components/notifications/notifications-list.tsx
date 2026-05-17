'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import type { Notification } from '@/types'
import { notificationsService } from '@/lib/api'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { RowsSkeleton } from '@/components/common/page-skeleton'
import { NotificationItem } from './notification-item'

export function NotificationsList() {
  const { session } = useSession()
  const userId = session?.user.id

  const [items, setItems] = useState<Notification[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    notificationsService
      .listForUser(userId, { unreadOnly, pageSize: 100 })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, unreadOnly, retryKey])

  function handleRetry() {
    setError(false)
    setRetryKey((k) => k + 1)
  }

  async function handleMarkRead(id: string) {
    try {
      await notificationsService.markRead(id)
      setItems((prev) => (prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev))
    } catch {
      toast.error('No pudimos marcar la notificación como leída.')
    }
  }

  async function handleMarkAllRead() {
    if (!userId) return
    try {
      await notificationsService.markAllRead(userId)
      setItems((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev))
      toast.success('Marcadas como leídas')
    } catch {
      toast.error('No pudimos actualizar las notificaciones.')
    }
  }

  const hasUnread = items?.some((n) => !n.read) ?? false

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground text-sm">
          Avisos de campañas que apoyas, actualizaciones y resoluciones de reportes.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          Solo no leídas
        </label>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState onRetry={handleRetry} />
      ) : loading || !items ? (
        <RowsSkeleton count={5} rowHeight="h-14" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? 'Sin notificaciones no leídas' : 'Sin notificaciones por ahora'}
          description={
            unreadOnly
              ? 'Ya estás al día con tus notificaciones.'
              : 'Te avisaremos aquí cuando ocurra algo relevante.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}

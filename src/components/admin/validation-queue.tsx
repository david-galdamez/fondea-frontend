'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight, ListChecks } from 'lucide-react'
import type { Campaign, User } from '@/types'
import { adminService, usersService } from '@/lib/api'
import { formatShortDate } from '@/lib/dates'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface Data {
  campaigns: Campaign[]
  creatorsById: Map<string, User>
}

export function ValidationQueue() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<Data> {
      const page = await adminService.listPendingReview(1, 100)
      const creatorIds = Array.from(new Set(page.items.map((c) => c.creatorId)))
      const users = await Promise.all(
        creatorIds.map((id) => usersService.getById(id).catch(() => null))
      )
      const creatorsById = new Map<string, User>()
      users.forEach((u) => {
        if (u) creatorsById.set(u.id, u)
      })
      return { campaigns: page.items, creatorsById }
    }
    load()
      .then((d) => {
        if (cancelled) return
        setData(d)
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
  }, [retryKey])

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="list" />

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Cola de validación</h1>
        <p className="text-muted-foreground text-sm">
          Campañas enviadas por creadores esperando aprobación o rechazo.
        </p>
      </header>

      {data.campaigns.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin campañas en revisión"
          description="Cuando un creador envíe una campaña aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.campaigns.map((c) => {
            const creator = data.creatorsById.get(c.creatorId)
            return (
              <Link
                key={c.id}
                href={`/admin/validacion/${c.id}`}
                className="group border-border bg-card hover:border-foreground/20 flex items-center gap-4 rounded-lg border p-4 transition-colors"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-muted-foreground text-xs">
                    Por {creator?.name ?? 'Creador desconocido'} · enviada{' '}
                    {formatShortDate(c.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-xs">
                  <span className="text-muted-foreground">Meta</span>
                  <MoneyDisplay value={c.goal} className="text-sm font-medium" />
                </div>
                <ChevronRight
                  className="text-muted-foreground size-4 shrink-0"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

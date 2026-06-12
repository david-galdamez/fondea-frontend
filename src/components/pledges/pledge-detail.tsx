'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { MyPledgeDto } from '@/lib/api/pledges.service'
import { pledgesService } from '@/lib/api'
import { formatLongDate } from '@/lib/dates'
import { money } from '@/lib/money'
import { useSession } from '@/components/providers/session-provider'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PledgeStatusBadge } from './pledge-status-badge'

interface PledgeDetailProps {
  id: string
}

export function PledgeDetail({ id }: PledgeDetailProps) {
  const { session } = useSession()
  const userId = session?.user.id

  const [pledge, setPledge] = useState<MyPledgeDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    pledgesService
      .getMine()
      .then((items) => {
        if (cancelled) return
        const found = items.find((p) => p.id === id) ?? null
        setPledge(found)
        setNotFound(!found)
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
  }, [userId, id, retryKey])

  if (loading) {
    return <PageSkeleton variant="detail" />
  }

  if (notFound) {
    return (
      <ErrorState
        title="Promesa no encontrada"
        description="Es posible que el link esté roto o que la promesa haya sido eliminada."
      />
    )
  }

  if (error || !pledge) {
    return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/pledges"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Volver a mis promesas
      </Link>

      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Detalle de promesa</h1>
          <PledgeStatusBadge status={pledge.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          Creada el {formatLongDate(pledge.createdAt)}
        </p>
      </header>

      <section className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Campaña</dt>
            <dd className="text-sm font-medium">
              <Link href={`/campanas/${pledge.campaignId}`} className="hover:underline">
                {pledge.campaignTitle}
              </Link>
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Creador</dt>
            <dd className="text-sm font-medium">{pledge.creatorName}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Recompensa</dt>
            <dd className="text-sm font-medium">{pledge.rewardTitle ?? 'Sin recompensa'}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Monto</dt>
            <dd className="text-sm font-semibold">
              <MoneyDisplay value={money(Math.round(pledge.amount * 100))} />
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Cierre de la campaña</dt>
            <dd className="text-sm">{formatLongDate(pledge.campaignDeadline)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, FileText, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign, Pledge, Reward } from '@/types'
import {
  ApiError,
  campaignsService,
  NotFoundError,
  pledgesService,
  rewardsService,
} from '@/lib/api'
import { formatLongDate } from '@/lib/dates'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PledgeStatusBadge } from './pledge-status-badge'

interface PledgeDetailProps {
  id: string
}

interface DetailData {
  pledge: Pledge
  campaign: Campaign | null
  reward: Reward | null
}

export function PledgeDetail({ id }: PledgeDetailProps) {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const pledge = await pledgesService.getById(id)
      const [campaign, reward] = await Promise.all([
        campaignsService.getById(pledge.campaignId).catch(() => null),
        pledge.rewardId
          ? rewardsService.getById(pledge.rewardId).catch(() => null)
          : Promise.resolve(null),
      ])
      return { pledge, campaign, reward }
    }

    load()
      .then((d) => {
        if (cancelled) return
        setData(d)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Error desconocido'))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, retryKey])

  async function handleCancel() {
    if (!data || !userId) return
    setCancelling(true)
    try {
      await pledgesService.cancel(data.pledge.id, userId)
      toast.success('Promesa cancelada')
      router.push('/dashboard/pledges')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No pudimos cancelar la promesa. Intenta de nuevo.'
      toast.error(message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return <PageSkeleton variant="detail" />
  }

  if (error instanceof NotFoundError) {
    return (
      <ErrorState
        title="Promesa no encontrada"
        description="Es posible que el link esté roto o que la promesa haya sido eliminada."
      />
    )
  }

  if (error || !data) {
    return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  }

  const { pledge, campaign, reward } = data
  const isOwn = pledge.backerId === userId
  const canCancel = isOwn && (pledge.status === 'authorized' || pledge.status === 'pending')

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
          {pledge.chargedAt && ` · Cobrada el ${formatLongDate(pledge.chargedAt)}`}
          {pledge.refundedAt && ` · Reembolsada el ${formatLongDate(pledge.refundedAt)}`}
        </p>
      </header>

      <section className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Campaña</dt>
            <dd className="text-sm font-medium">
              {campaign ? (
                <Link href={`/campanas/${campaign.slug}`} className="hover:underline">
                  {campaign.title}
                </Link>
              ) : (
                'Campaña eliminada'
              )}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Recompensa</dt>
            <dd className="text-sm font-medium">{reward?.title ?? 'Sin recompensa'}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Monto</dt>
            <dd className="text-sm font-semibold">
              <MoneyDisplay value={pledge.amount} />
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Visibilidad</dt>
            <dd className="text-sm">{pledge.isAnonymous ? 'Anónimo' : 'Público'}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Certificado de donación</dt>
            <dd className="text-sm">{pledge.wantsCertificate ? 'Solicitado' : 'No solicitado'}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          render={
            <a href={`#mock-recibo-${pledge.id}.pdf`} target="_blank" rel="noreferrer">
              <FileText className="size-4" />
              Descargar recibo
            </a>
          }
          variant="outline"
        />
        {canCancel && (
          <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
            <XCircle className="size-4" />
            {cancelling ? 'Cancelando…' : 'Cancelar promesa'}
          </Button>
        )}
      </div>
    </div>
  )
}

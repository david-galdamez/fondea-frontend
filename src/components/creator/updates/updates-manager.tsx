'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign, CampaignUpdate } from '@/types'
import { ApiError, campaignsService, updatesService } from '@/lib/api'
import { formatLongDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { ConfirmDialog, useConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface UpdatesManagerProps {
  campaignId: string
}

interface Data {
  campaign: Campaign
  updates: CampaignUpdate[]
}

export function UpdatesManager({ campaignId }: UpdatesManagerProps) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const confirm = useConfirmDialog<string>()

  useEffect(() => {
    let cancelled = false
    Promise.all([campaignsService.getById(campaignId), updatesService.listByCampaign(campaignId)])
      .then(([campaign, updates]) => {
        if (cancelled) return
        setData({ campaign, updates })
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
  }, [campaignId, retryKey])

  async function removeUpdate(id: string) {
    try {
      await updatesService.remove(id)
      setData((prev) =>
        prev ? { ...prev, updates: prev.updates.filter((u) => u.id !== id) } : prev
      )
      toast.success('Actualización eliminada')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos eliminarla'
      toast.error(message)
    }
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="list" />

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">{data.campaign.title}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Actualizaciones</h1>
          <p className="text-muted-foreground text-sm">
            Mantén informados a tus patrocinadores sobre el avance de la campaña.
          </p>
        </div>
        <Button
          render={<Link href={`/creador/campanas/${campaignId}/actualizaciones/nueva`} />}
          size="sm"
        >
          <Plus className="size-4" />
          Nueva actualización
        </Button>
      </header>

      {data.updates.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aún no publicaste actualizaciones"
          description="Comparte avances, hitos y mensajes a tus patrocinadores."
          action={
            <Button
              render={<Link href={`/creador/campanas/${campaignId}/actualizaciones/nueva`} />}
              variant="outline"
              size="sm"
            >
              <Plus className="size-4" />
              Crear primera actualización
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.updates.map((u) => (
            <article
              key={u.id}
              className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4"
            >
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold">{u.title}</h3>
                  <p className="text-muted-foreground text-xs">
                    {formatLongDate(u.publishedAt)} ·{' '}
                    {u.visibility === 'public' ? 'Pública' : 'Solo patrocinadores'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => confirm.ask(u.id)}
                  disabled={confirm.confirming && confirm.target === u.id}
                  aria-label="Eliminar actualización"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </header>
              <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">
                {u.body}
              </p>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(next) => (next ? null : confirm.close())}
        title="¿Eliminar esta actualización?"
        description="Los patrocinadores que ya la recibieron dejarán de verla. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Volver"
        variant="destructive"
        confirming={confirm.confirming}
        onConfirm={() => confirm.run((id) => removeUpdate(id))}
      />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, ChevronLeft, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign, Category, FAQ, Reward, User } from '@/types'
import {
  ApiError,
  adminService,
  campaignsService,
  categoriesService,
  faqsService,
  rewardsService,
  usersService,
} from '@/lib/api'
import { formatLongDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { CategoryBadge } from '@/components/campaigns/category-badge'
import { LocationBadge } from '@/components/campaigns/location-badge'
import { RewardCard } from '@/components/campaigns/reward-card'
import { StatusBadge } from '@/components/campaigns/status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'

interface ValidationDetailProps {
  campaignId: string
}

interface Data {
  campaign: Campaign
  creator: User | null
  category: Category | null
  rewards: Reward[]
  faqs: FAQ[]
}

export function ValidationDetail({ campaignId }: ValidationDetailProps) {
  const router = useRouter()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<Data> {
      const campaign = await campaignsService.getById(campaignId)
      const [creator, category, rewards, faqs] = await Promise.all([
        usersService.getById(campaign.creatorId).catch(() => null),
        categoriesService
          .list()
          .then((all) => all.find((c) => c.id === campaign.categoryId) ?? null),
        rewardsService.listByCampaign(campaign.id),
        faqsService.listByCampaign(campaign.id),
      ])
      return { campaign, creator, category, rewards, faqs }
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
  }, [campaignId, retryKey])

  async function handleApprove() {
    setBusy(true)
    try {
      const updated = await adminService.approveCampaign(campaignId)
      setData((prev) => (prev ? { ...prev, campaign: updated } : prev))
      toast.success('Campaña aprobada')
      router.push('/admin/validacion')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos aprobar la campaña'
      toast.error(message)
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error('Indica un motivo de rechazo')
      return
    }
    setBusy(true)
    try {
      const updated = await adminService.rejectCampaign(campaignId, rejectionReason.trim())
      setData((prev) => (prev ? { ...prev, campaign: updated } : prev))
      toast.success('Campaña rechazada')
      router.push('/admin/validacion')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos rechazar la campaña'
      toast.error(message)
      setBusy(false)
    }
  }

  async function handleToggleFeatured() {
    if (!data) return
    setBusy(true)
    try {
      const updated = await adminService.setFeatured(campaignId, !data.campaign.featured)
      setData((prev) => (prev ? { ...prev, campaign: updated } : prev))
      toast.success(updated.featured ? 'Marcada como destacada' : 'Quitada de destacadas')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos actualizar la campaña'
      toast.error(message)
    }
    setBusy(false)
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <p className="text-muted-foreground py-6 text-sm">Cargando…</p>

  const { campaign, creator, category, rewards, faqs } = data
  const isPending = campaign.status === 'pending_review'

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/validacion"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Volver a la cola
      </Link>

      <header className="flex flex-col gap-3">
        {campaign.coverImageUrl && (
          <div className="bg-muted aspect-[16/9] w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campaign.coverImageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={campaign.status} />
          {category && <CategoryBadge category={category} />}
          <LocationBadge location={campaign.location} />
          {campaign.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Sparkles className="size-3" />
              Destacada
            </span>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{campaign.title}</h1>
        <p className="text-muted-foreground">{campaign.summary}</p>
        <p className="text-muted-foreground text-xs">
          Por {creator?.name ?? 'Creador desconocido'}
          {creator?.email && ` · ${creator.email}`} · enviada {formatLongDate(campaign.updatedAt)}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Descripción</h2>
            <div className="text-foreground/90 whitespace-pre-wrap">
              {campaign.description || 'Sin descripción.'}
            </div>
          </section>

          {rewards.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Recompensas ({rewards.length})</h2>
              <div className="flex flex-col gap-3">
                {rewards.map((r) => (
                  <RewardCard key={r.id} reward={r} />
                ))}
              </div>
            </section>
          )}

          {faqs.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Preguntas frecuentes ({faqs.length})</h2>
              <dl className="flex flex-col gap-3">
                {faqs.map((f) => (
                  <div key={f.id} className="border-border bg-card flex flex-col gap-1 rounded-lg border p-4">
                    <dt className="font-medium">{f.question}</dt>
                    <dd className="text-muted-foreground text-sm whitespace-pre-wrap">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Sin preguntas frecuentes"
              description="La campaña no incluye FAQs."
            />
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
            <CampaignProgress
              raised={campaign.raised}
              goal={campaign.goal}
              backersCount={campaign.backersCount}
            />
            <div className="flex flex-col gap-1 text-sm">
              <DataRow label="Tipo" value={campaign.goalType === 'fixed' ? 'Fija' : 'Flexible'} />
              <DataRow label="Duración" value={`${campaign.durationDays} días`} />
              <DataRow
                label="Meta"
                value={<MoneyDisplay value={campaign.goal} className="font-medium" />}
              />
            </div>
          </div>

          {campaign.rejectionReason && (
            <div className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 rounded-lg border p-3 text-sm">
              <p className="font-medium">Motivo de rechazo previo</p>
              <p>{campaign.rejectionReason}</p>
            </div>
          )}

          <div className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Acciones</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleFeatured}
              disabled={busy}
            >
              <Sparkles className="size-4" />
              {campaign.featured ? 'Quitar de destacadas' : 'Marcar como destacada'}
            </Button>
            {isPending ? (
              <>
                <Button type="button" size="sm" onClick={handleApprove} disabled={busy}>
                  <Check className="size-4" />
                  Aprobar
                </Button>
                {!showRejectForm ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
                    disabled={busy}
                  >
                    <X className="size-4" />
                    Rechazar
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reject-reason" className="text-xs">
                      Motivo de rechazo
                    </Label>
                    <textarea
                      id="reject-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                      placeholder="Indica qué debe corregir el creador para volver a enviar."
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectionReason('')
                        }}
                        disabled={busy}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleReject}
                        disabled={busy}
                      >
                        Confirmar rechazo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-xs">
                La campaña ya no está en revisión. Solo puedes alternar el estado destacada.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

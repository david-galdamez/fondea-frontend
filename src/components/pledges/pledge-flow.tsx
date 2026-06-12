'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import type { CampaignDetailDto } from '@/lib/api/campaigns.service'
import type { PledgeCreatedDto } from '@/lib/api/pledges.service'
import type { RewardSummaryDto } from '@/lib/api/rewards.service'
import {
  ApiError,
  campaignsService,
  NotFoundError,
  pledgesService,
  rewardsService,
} from '@/lib/api'
import { formatMoney, money } from '@/lib/money'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { CountdownTimer } from '@/components/campaigns/countdown-timer'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface PledgeFlowProps {
  slug: string
}

type Step = 'choose' | 'confirm' | 'success'

const FREE_AMOUNT_KEY = '__free__'

function parseAmount(value: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return parsed
}

function toMoney(amount: number) {
  return money(Math.round(amount * 100))
}

export function PledgeFlow({ slug }: PledgeFlowProps) {
  const router = useRouter()
  const { session, isLoading: sessionLoading } = useSession()

  const [campaign, setCampaign] = useState<CampaignDetailDto | null>(null)
  const [rewards, setRewards] = useState<RewardSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [step, setStep] = useState<Step>('choose')
  const [selectedRewardId, setSelectedRewardId] = useState<string>(FREE_AMOUNT_KEY)
  const [amountInput, setAmountInput] = useState('25.00')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdPledge, setCreatedPledge] = useState<PledgeCreatedDto | null>(null)

  // Auth gate
  useEffect(() => {
    if (sessionLoading) return
    if (!session) {
      const redirect = encodeURIComponent(`/campanas/${slug}/apoyar`)
      router.replace(`/auth/login?redirect=${redirect}`)
    }
  }, [session, sessionLoading, router, slug])

  // Load campaign + rewards
  useEffect(() => {
    let cancelled = false
    campaignsService
      .getById(slug)
      .then(async (c) => {
        const rs = await rewardsService.getAvailable(c.id)
        if (cancelled) return
        setCampaign(c)
        setRewards(rs)
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
  }, [slug])

  const selectedReward =
    selectedRewardId === FREE_AMOUNT_KEY ? null : rewards.find((r) => r.id === selectedRewardId)

  function handleSelectReward(rewardId: string) {
    setSelectedRewardId(rewardId)
    if (rewardId === FREE_AMOUNT_KEY) return
    const reward = rewards.find((r) => r.id === rewardId)
    if (reward) setAmountInput(reward.minAmount.toFixed(2))
  }

  function goToConfirm() {
    const amount = parseAmount(amountInput)
    if (amount <= 0) {
      setSubmitError('Ingresa un monto válido en USD.')
      return
    }
    if (selectedReward && amount < selectedReward.minAmount) {
      setSubmitError(
        `El monto está por debajo del mínimo de la recompensa (${formatMoney(toMoney(selectedReward.minAmount))}).`
      )
      return
    }
    setSubmitError(null)
    setStep('confirm')
  }

  async function handleSubmit() {
    if (!session || !campaign) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const pledge = await pledgesService.create({
        campaignId: campaign.id,
        amount: parseAmount(amountInput),
        rewardId: selectedReward?.id,
      })
      setCreatedPledge(pledge)
      setStep('success')
      toast.success('¡Gracias por tu apoyo!')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No pudimos registrar tu promesa. Intenta de nuevo.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionLoading || !session || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <PageSkeleton variant="form" />
      </div>
    )
  }

  if (error instanceof NotFoundError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ErrorState
          title="No encontramos la campaña"
          description="Es posible que el link esté roto o la campaña haya sido eliminada."
        />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const isOwnCampaign = campaign.creatorId === session.user.id
  const notActive = campaign.status !== 'ACTIVE'

  if (isOwnCampaign || notActive) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
          <ShieldAlert className="text-muted-foreground size-8" aria-hidden="true" />
          <h1 className="text-xl font-semibold">No puedes apoyar esta campaña</h1>
          <p className="text-muted-foreground text-sm">
            {isOwnCampaign
              ? 'Eres el creador de esta campaña.'
              : 'La campaña no está activa en este momento.'}
          </p>
          <Button render={<Link href={`/campanas/${slug}`} />} variant="outline" className="mt-2">
            Volver a la campaña
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'success' && createdPledge) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="border-border bg-card flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold">¡Promesa registrada!</h1>
          <p className="text-muted-foreground">
            Apoyaste <span className="text-foreground font-medium">{campaign.title}</span> con{' '}
            <MoneyDisplay
              value={toMoney(createdPledge.amount)}
              className="text-foreground font-medium"
            />
            .
          </p>
          <p className="text-muted-foreground text-sm">
            Solo se te cobrará si la campaña alcanza su meta el{' '}
            {new Date(campaign.deadline).toLocaleDateString('es', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            .
          </p>
          <div className="mt-2 flex gap-2">
            <Button render={<Link href={`/dashboard/pledges/${createdPledge.id}`} />}>
              Ver mi promesa
            </Button>
            <Button render={<Link href="/explorar" />} variant="outline">
              Explorar más campañas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <Link
        href={`/campanas/${slug}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Volver a la campaña
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Apoyar campaña
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{campaign.title}</h1>
        <CampaignProgress
          raised={toMoney(campaign.totalPledged)}
          goal={toMoney(campaign.goalAmount)}
          backersCount={campaign.pledgeCount}
        />
        <CountdownTimer endDate={campaign.deadline} status={campaign.status} />
      </header>

      <div
        role="note"
        className="border-border bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-xs"
      >
        Modelo todo o nada: solo se cobra tu promesa si la campaña alcanza su meta.
      </div>

      {step === 'choose' && (
        <section className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold">Elige una recompensa</legend>

            <label
              data-active={selectedRewardId === FREE_AMOUNT_KEY}
              className="border-border data-[active=true]:border-primary data-[active=true]:bg-primary/5 flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors"
            >
              <input
                type="radio"
                name="reward"
                value={FREE_AMOUNT_KEY}
                checked={selectedRewardId === FREE_AMOUNT_KEY}
                onChange={() => handleSelectReward(FREE_AMOUNT_KEY)}
                className="sr-only"
              />
              <span className="text-sm font-medium">Apoyo sin recompensa</span>
              <span className="text-muted-foreground text-xs">
                Promete cualquier monto sin elegir una recompensa específica.
              </span>
            </label>

            {rewards.map((reward) => {
              const remaining = reward.stock ?? null
              const soldOut = remaining === 0
              return (
                <label
                  key={reward.id}
                  data-active={selectedRewardId === reward.id}
                  className="border-border data-[active=true]:border-primary data-[active=true]:bg-primary/5 flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60"
                  data-disabled={soldOut}
                >
                  <input
                    type="radio"
                    name="reward"
                    value={reward.id}
                    checked={selectedRewardId === reward.id}
                    onChange={() => handleSelectReward(reward.id)}
                    disabled={soldOut}
                    className="sr-only"
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{reward.title}</span>
                    <span className="text-foreground text-sm font-medium">
                      desde <MoneyDisplay value={toMoney(reward.minAmount)} />
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">{reward.description}</span>
                  {remaining !== null && (
                    <span className="text-muted-foreground text-xs">
                      {soldOut ? 'Agotada' : `${remaining} disponibles`}
                    </span>
                  )}
                </label>
              )
            })}
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Monto a prometer (USD)</Label>
            <div className="relative">
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm">
                $
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={selectedReward ? selectedReward.minAmount : 1}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="pl-6"
              />
            </div>
            {selectedReward && (
              <p className="text-muted-foreground text-xs">
                Mínimo: <MoneyDisplay value={toMoney(selectedReward.minAmount)} />
              </p>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
            >
              {submitError}
            </p>
          )}

          <Button onClick={goToConfirm} size="lg" className="w-full">
            Continuar
            <ChevronRight className="size-4" />
          </Button>
        </section>
      )}

      {step === 'confirm' && (
        <section className="flex flex-col gap-4">
          <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Resumen</h2>
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Campaña</dt>
                <dd className="text-right">{campaign.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Recompensa</dt>
                <dd className="text-right">{selectedReward?.title ?? 'Sin recompensa'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Monto</dt>
                <dd className="text-right font-medium">
                  <MoneyDisplay value={toMoney(parseAmount(amountInput))} />
                </dd>
              </div>
            </dl>
          </div>

          {submitError && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
            >
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setStep('choose')}
              disabled={submitting}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? 'Registrando…' : 'Confirmar promesa'}
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Banknote, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign, Withdrawal, WithdrawalLimit } from '@/types'
import { ApiError, campaignsService, withdrawalsService } from '@/lib/api'
import { COMMISSION_RATE } from '@/lib/constants'
import { compareMoney, money, multiplyMoney } from '@/lib/money'
import { centsToDollarsString, dollarsToCents } from '@/lib/wizard-helpers'
import { formatShortDate } from '@/lib/dates'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'

interface Data {
  campaigns: Campaign[]
  withdrawals: Withdrawal[]
  limits: WithdrawalLimit
}

const STATUS_LABEL: Record<Withdrawal['status'], string> = {
  requested: 'Solicitado',
  approved: 'Aprobado',
  paid: 'Pagado',
  rejected: 'Rechazado',
}

const STATUS_CLASSES: Record<Withdrawal['status'], string> = {
  requested: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  approved: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  paid: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  rejected: 'bg-destructive/10 text-destructive',
}

export function WithdrawalsPage() {
  const { session } = useSession()
  const userId = session?.user.id

  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [amountInput, setAmountInput] = useState<string>('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    Promise.all([
      campaignsService.getByCreator(userId),
      withdrawalsService.listByCreator(userId),
      withdrawalsService.getLimits(userId),
    ])
      .then(([campaigns, withdrawals, limits]) => {
        if (cancelled) return
        setData({ campaigns, withdrawals, limits })
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
  }, [userId, retryKey])

  const eligibleCampaigns = useMemo(() => {
    if (!data) return []
    return data.campaigns
      .filter((c) => c.status === 'successful')
      .map((c) => {
        const withdrawn = data.withdrawals
          .filter((w) => w.campaignId === c.id && w.status !== 'rejected')
          .reduce((acc, w) => acc + w.gross.amount, 0)
        const available = Math.max(0, c.raised.amount - withdrawn)
        return { campaign: c, availableCents: available }
      })
      .filter((row) => row.availableCents > 0)
  }, [data])

  const selected = eligibleCampaigns.find((r) => r.campaign.id === selectedCampaignId) ?? null
  const grossCents = dollarsToCents(amountInput)
  const grossMoney = money(grossCents)
  const commissionMoney = multiplyMoney(grossMoney, COMMISSION_RATE)
  const netMoney = money(Math.max(0, grossCents - commissionMoney.amount))

  const overAvailable = !!selected && grossCents > selected.availableCents
  const limitExceeded =
    !!data?.limits.isNewCreator &&
    grossCents > 0 &&
    compareMoney(
      { ...data.limits.usedToday, amount: data.limits.usedToday.amount + netMoney.amount },
      data.limits.dailyMax
    ) > 0

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!userId || !selected) return
    if (grossCents <= 0) {
      toast.error('Ingresa un monto mayor a cero')
      return
    }
    if (overAvailable) {
      toast.error('Excede lo disponible para esta campaña')
      return
    }
    setBusy(true)
    try {
      await withdrawalsService.request(userId, selected.campaign.id, grossMoney)
      toast.success('Retiro solicitado')
      setAmountInput('')
      setRetryKey((k) => k + 1)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos crear la solicitud'
      toast.error(message)
    }
    setBusy(false)
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <p className="text-muted-foreground py-6 text-sm">Cargando…</p>

  const remainingToday = money(
    Math.max(0, data.limits.dailyMax.amount - data.limits.usedToday.amount)
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Retiros</h1>
        <p className="text-muted-foreground text-sm">
          Solicita el pago de los fondos recaudados en tus campañas exitosas.
        </p>
      </header>

      {data.limits.isNewCreator && (
        <aside className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 flex flex-col gap-1 rounded-lg border p-4 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Límite diario para nuevos creadores
          </div>
          <p>
            Hoy puedes retirar hasta <MoneyDisplay value={data.limits.dailyMax} /> neto. Usado hoy:{' '}
            <MoneyDisplay value={data.limits.usedToday} /> · Disponible:{' '}
            <MoneyDisplay value={remainingToday} />.
          </p>
        </aside>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Solicitar retiro</h2>
        {eligibleCampaigns.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="Sin fondos disponibles para retirar"
            description="Solo las campañas exitosas con saldo pendiente aparecen aquí."
          />
        ) : (
          <form
            className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4"
            onSubmit={handleRequest}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campaign">Campaña</Label>
              <select
                id="campaign"
                className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
              >
                <option value="">Selecciona una campaña…</option>
                {eligibleCampaigns.map((row) => (
                  <option key={row.campaign.id} value={row.campaign.id}>
                    {row.campaign.title} — Disponible {centsToDollarsString(row.availableCents)} USD
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount">Monto a retirar (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    step="0.01"
                    max={selected.availableCents / 100}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    aria-invalid={overAvailable}
                  />
                  {overAvailable && (
                    <span className="text-destructive text-xs">
                      Excede lo disponible (<MoneyDisplay value={money(selected.availableCents)} />)
                    </span>
                  )}
                  {limitExceeded && (
                    <span className="text-destructive text-xs">
                      Excede el límite diario para nuevos creadores
                    </span>
                  )}
                </div>

                <div className="border-border bg-muted/40 flex flex-col gap-1 rounded-md border p-3 text-sm">
                  <Row label="Bruto solicitado" value={<MoneyDisplay value={grossMoney} />} />
                  <Row
                    label={`Comisión Fondea (${Math.round(COMMISSION_RATE * 100)}%)`}
                    value={
                      <span className="text-muted-foreground">
                        − <MoneyDisplay value={commissionMoney} />
                      </span>
                    }
                  />
                  <div className="border-border my-1 border-t" />
                  <Row
                    label={<span className="font-medium">Neto a recibir</span>}
                    value={<MoneyDisplay value={netMoney} className="font-semibold" />}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              size="sm"
              className="self-end"
              disabled={busy || !selected || grossCents <= 0 || overAvailable || limitExceeded}
            >
              Solicitar retiro
            </Button>
          </form>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Historial</h2>
        {data.withdrawals.length === 0 ? (
          <EmptyState icon={Banknote} title="Aún no has solicitado retiros" />
        ) : (
          <div className="flex flex-col gap-2">
            {data.withdrawals.map((w) => {
              const campaign = data.campaigns.find((c) => c.id === w.campaignId)
              return (
                <div
                  key={w.id}
                  className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium">
                      {campaign?.title ?? 'Campaña eliminada'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Solicitado {formatShortDate(w.requestedAt)}
                    </p>
                    {w.rejectionReason && (
                      <p className="text-destructive text-xs">Motivo: {w.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <MoneyDisplay value={w.net} className="text-sm font-medium" />
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[w.status]}`}
                    >
                      {STATUS_LABEL[w.status]}
                    </span>
                  </div>
                  <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

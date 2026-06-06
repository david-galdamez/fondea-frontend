'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Banknote, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError, campaignsService, withdrawalsService } from '@/lib/api'
import type { MyCampaignDto } from '@/lib/api/campaigns.service'
import type { WithdrawalDto, WithdrawalLimitsDto } from '@/lib/api/withdrawals.service'
import { COMMISSION_RATE } from '@/lib/constants'
import { money, multiplyMoney } from '@/lib/money'
import { formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { PageSkeleton } from '@/components/common/page-skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Data {
  campaigns: MyCampaignDto[]
  withdrawals: WithdrawalDto[]
  limits: WithdrawalLimitsDto
}

// ─── Status display ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  PAID: 'Pagado',
  REJECTED: 'Rechazado',
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  APPROVED: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  PAID: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  REJECTED: 'bg-destructive/10 text-destructive',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WithdrawalsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      campaignsService.getMine(),
      withdrawalsService.getMine(),
      withdrawalsService.getLimits(),
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
    return () => { cancelled = true }
  }, [retryKey])

  // Campañas exitosas con saldo disponible
  const eligibleCampaigns = useMemo(() => {
    if (!data) return []
    return data.campaigns
      .filter((c) => c.status === 'SUCCESSFUL' && c.availableToWithdraw != null && c.availableToWithdraw > 0)
      .map((c) => ({
        campaign: c,
        available: c.availableToWithdraw!, // BigDecimal en dólares desde el backend
      }))
  }, [data])

  const selected = eligibleCampaigns.find((r) => r.campaign.id === selectedCampaignId) ?? null
  const grossAmount = Number(amountInput) || 0
  const grossMoney = money(Math.round(grossAmount * 100))
  const commissionMoney = multiplyMoney(grossMoney, COMMISSION_RATE)
  const netMoney = money(Math.max(0, grossMoney.amount - commissionMoney.amount))

  const overAvailable = !!selected && grossAmount > selected.available
  const limitExceeded =
    !!data?.limits.isNewCreator &&
    grossAmount > 0 &&
    grossAmount > data.limits.availableToday

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || grossAmount <= 0) {
      toast.error('Ingresa un monto mayor a cero')
      return
    }
    if (overAvailable) {
      toast.error('Excede lo disponible para esta campaña')
      return
    }
    if (limitExceeded) {
      toast.error('Excede el límite diario para nuevos creadores')
      return
    }
    setBusy(true)
    try {
      await withdrawalsService.request({
        campaignId: selected.campaign.id,
        grossAmount,
      })
      toast.success('Retiro solicitado')
      setAmountInput('')
      setSelectedCampaignId('')
      setRetryKey((k) => k + 1)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos crear la solicitud'
      toast.error(message)
    }
    setBusy(false)
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !data) return <PageSkeleton variant="summary" />

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Retiros</h1>
        <p className="text-muted-foreground text-sm">
          Solicita el pago de los fondos recaudados en tus campañas exitosas.
        </p>
      </header>

      {/* Límite diario para nuevos creadores */}
      {data.limits.isNewCreator && (
        <aside className="flex flex-col gap-1 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Límite diario para nuevos creadores
          </div>
          <p>
            Hoy puedes retirar hasta{' '}
            <MoneyDisplay value={money(Math.round(data.limits.dailyLimit * 100))} /> neto. Usado
            hoy: <MoneyDisplay value={money(Math.round(data.limits.usedToday * 100))} /> ·
            Disponible:{' '}
            <MoneyDisplay value={money(Math.round(data.limits.availableToday * 100))} />.
          </p>
        </aside>
      )}

      {/* Formulario de retiro */}
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
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
              >
                <option value="">Selecciona una campaña…</option>
                {eligibleCampaigns.map((row) => (
                  <option key={row.campaign.id} value={row.campaign.id}>
                    {row.campaign.title} — Disponible ${row.available.toFixed(2)} USD
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
                    min={0.01}
                    step="0.01"
                    max={selected.available}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    aria-invalid={overAvailable || limitExceeded}
                  />
                  {overAvailable && (
                    <span className="text-destructive text-xs">
                      Excede lo disponible (${selected.available.toFixed(2)} USD)
                    </span>
                  )}
                  {limitExceeded && !overAvailable && (
                    <span className="text-destructive text-xs">
                      Excede el límite diario disponible ($
                      {data.limits.availableToday.toFixed(2)} USD)
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
              disabled={busy || !selected || grossAmount <= 0 || overAvailable || limitExceeded}
            >
              Solicitar retiro
            </Button>
          </form>
        )}
      </section>

      {/* Historial */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Historial</h2>
        {data.withdrawals.length === 0 ? (
          <EmptyState icon={Banknote} title="Aún no has solicitado retiros" />
        ) : (
          <div className="flex flex-col gap-2">
            {data.withdrawals.map((w) => (
              <div
                key={w.id}
                className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{w.campaignTitle}</p>
                  <p className="text-muted-foreground text-xs">
                    Solicitado {formatShortDate(w.requestedAt)}
                  </p>
                  {w.paidAt && (
                    <p className="text-muted-foreground text-xs">
                      Pagado {formatShortDate(w.paidAt)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <MoneyDisplay
                    value={money(Math.round(w.netAmount * 100))}
                    className="text-sm font-medium"
                  />
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[w.status] ?? ''}`}
                  >
                    {STATUS_LABEL[w.status] ?? w.status}
                  </span>
                </div>
                <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </div>
            ))}
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

'use client'

import { useEffect, useState } from 'react'
import { Banknote, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { adminService, ApiError } from '@/lib/api'
import type { AdminWithdrawalDto } from '@/lib/api/admin.service'
import { formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MoneyDisplay } from '@/components/common/money-display'
import { RowsSkeleton } from '@/components/common/page-skeleton'
import { money } from '@/lib/money'

export function WithdrawalsList() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    adminService
      .getPendingWithdrawals()
      .then((items) => {
        if (cancelled) return
        setWithdrawals(items)
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

  async function handleApprove(id: string) {
    setBusy(id)
    try {
      await adminService.approveWithdrawal(id)
      setWithdrawals((prev) => (prev ? prev.filter((w) => w.id !== id) : prev))
      toast.success('Retiro aprobado')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al aprobar retiro'
      toast.error(message)
    }
    setBusy(null)
  }

  async function handleReject(id: string) {
    setBusy(id)
    try {
      await adminService.rejectWithdrawal(id)
      setWithdrawals((prev) => (prev ? prev.filter((w) => w.id !== id) : prev))
      toast.success('Retiro rechazado')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al rechazar retiro'
      toast.error(message)
    }
    setBusy(null)
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !withdrawals) return <RowsSkeleton count={4} rowHeight="h-20" />

  const totalPending = withdrawals.reduce((acc, w) => acc + w.netAmount, 0)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Retiros pendientes</h1>
        <p className="text-muted-foreground text-sm">
          Solicitudes de retiro de creadores esperando aprobación.
        </p>
      </header>

      {withdrawals.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="Sin retiros pendientes"
          description="Todas las solicitudes de retiro han sido procesadas."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{w.campaignTitle}</p>
                  <p className="text-muted-foreground text-xs">
                    Solicitado el {formatShortDate(w.requestedAt)}
                    {w.commissionAmount > 0 && (
                      <span className="ml-2">
                        Comisión:{' '}
                        <MoneyDisplay value={money(Math.round(w.commissionAmount * 100))} />
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MoneyDisplay
                    value={money(Math.round(w.netAmount * 100))}
                    className="text-sm font-semibold"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApprove(w.id)}
                    disabled={busy === w.id}
                  >
                    <Check className="size-4" />
                    Aprobar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(w.id)}
                    disabled={busy === w.id}
                  >
                    <X className="size-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Total en espera:{' '}
            <MoneyDisplay
              value={money(Math.round(totalPending * 100))}
              className="text-foreground font-medium"
            />
          </p>
        </div>
      )}
    </div>
  )
}

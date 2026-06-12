'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import type { DonationCertificate } from '@/types'
import { certificatesService } from '@/lib/api'
import { useSession } from '@/components/providers/session-provider'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { RowsSkeleton } from '@/components/common/page-skeleton'
import { CertificateItem } from './certificate-item'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function CertificatesList() {
  const { session } = useSession()
  const userId = session?.user.id

  const [certificates, setCertificates] = useState<DonationCertificate[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    certificatesService
      .listMine()
      .then((certs) => {
        if (cancelled) return
        setCertificates(certs)
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

  const years = useMemo(() => {
    if (!certificates) return []
    return Array.from(new Set(certificates.map((c) => c.taxYear))).sort((a, b) => b - a)
  }, [certificates])

  const visible = certificates?.filter((c) => !yearFilter || c.taxYear === Number(yearFilter)) ?? []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Certificados de donación</h1>
        <p className="text-muted-foreground text-sm">
          Documentos para desgravación fiscal de las campañas que apoyaste con éxito.
        </p>
      </header>

      {years.length > 0 && (
        <div className="flex items-center gap-2">
          <Label htmlFor="year-filter" className="text-xs">
            Año fiscal
          </Label>
          <select
            id="year-filter"
            className={SELECT_CLASS}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {error ? (
        <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
      ) : loading || !certificates ? (
        <RowsSkeleton count={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            certificates.length === 0
              ? 'Aún no tienes certificados'
              : 'Sin certificados para ese año'
          }
          description={
            certificates.length === 0
              ? 'Se emiten cuando una campaña que apoyaste alcanza su meta y completas el cobro.'
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((c) => (
            <CertificateItem key={c.id} certificate={c} />
          ))}
        </div>
      )}
    </div>
  )
}

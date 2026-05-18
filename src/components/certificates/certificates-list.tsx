'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import type { Campaign, DonationCertificate } from '@/types'
import { campaignsService, certificatesService } from '@/lib/api'
import { useSession } from '@/components/providers/session-provider'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { RowsSkeleton } from '@/components/common/page-skeleton'
import { CertificateItem } from './certificate-item'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface CertificatesData {
  certificates: DonationCertificate[]
  campaignsById: Map<string, Campaign>
}

export function CertificatesList() {
  const { session } = useSession()
  const userId = session?.user.id

  const [data, setData] = useState<CertificatesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    certificatesService
      .listForBacker(userId)
      .then(async (certs) => {
        const ids = Array.from(new Set(certs.map((c) => c.campaignId)))
        const campaigns = await Promise.all(
          ids.map((id) => campaignsService.getById(id).catch(() => null))
        )
        if (cancelled) return
        const campaignsById = new Map<string, Campaign>()
        campaigns.forEach((c) => {
          if (c) campaignsById.set(c.id, c)
        })
        setData({ certificates: certs, campaignsById })
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
    if (!data) return []
    return Array.from(new Set(data.certificates.map((c) => c.taxYear))).sort((a, b) => b - a)
  }, [data])

  const visible =
    data?.certificates.filter((c) => !yearFilter || c.taxYear === Number(yearFilter)) ?? []

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
      ) : loading || !data ? (
        <RowsSkeleton count={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            data.certificates.length === 0
              ? 'Aún no tienes certificados'
              : 'Sin certificados para ese año'
          }
          description={
            data.certificates.length === 0
              ? 'Se emiten cuando una campaña que apoyaste alcanza su meta y completas el cobro.'
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((c) => (
            <CertificateItem
              key={c.id}
              certificate={c}
              campaign={data.campaignsById.get(c.campaignId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import type { FraudReason } from '@/lib/api/fraud.service'
import type { CampaignDetailDto } from '@/lib/api/campaigns.service'
import { ApiError, campaignsService, fraudService, NotFoundError } from '@/lib/api'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface ReportFraudFormProps {
  slug: string
}

const REASON_OPTIONS: { value: FraudReason; label: string; helper: string }[] = [
  {
    value: 'misleading_info',
    label: 'Información engañosa',
    helper: 'La descripción, metas o usos de los fondos parecen falsos o exagerados.',
  },
  {
    value: 'identity_theft',
    label: 'Suplantación de identidad',
    helper: 'El creador parece estar haciéndose pasar por otra persona u organización.',
  },
  {
    value: 'inappropriate_content',
    label: 'Contenido inapropiado',
    helper: 'Contenido ofensivo, ilegal o que viola los términos de la plataforma.',
  },
  {
    value: 'spam',
    label: 'Spam o estafa',
    helper: 'La campaña parece automatizada, repetida o un esquema de estafa.',
  },
  {
    value: 'other',
    label: 'Otro',
    helper: 'Otro motivo no listado. Por favor descríbelo en detalle.',
  },
]

const SELECT_CLASS =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3'
const TEXTAREA_CLASS =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3'

const DETAILS_MIN = 20
const DETAILS_MAX = 1000

export function ReportFraudForm({ slug }: ReportFraudFormProps) {
  const router = useRouter()
  const { session, isLoading: sessionLoading } = useSession()
  const userId = session?.user.id

  const [campaign, setCampaign] = useState<CampaignDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const [reason, setReason] = useState<FraudReason>('misleading_info')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState<{ details?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    campaignsService
      .getBySlug(slug)
      .then((c) => {
        if (cancelled) return
        setCampaign(c)
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
  }, [slug, retryKey])

  if (loading) return <PageSkeleton variant="form" />

  if (error instanceof NotFoundError) {
    return (
      <ErrorState
        title="Campaña no encontrada"
        description="Es posible que el enlace esté roto o que la campaña haya sido eliminada."
      />
    )
  }
  if (error || !campaign) {
    return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!campaign) return

    if (sessionLoading) return
    if (!userId) {
      toast.error('Inicia sesión para enviar un reporte')
      router.push(`/auth/login?redirect=${encodeURIComponent(`/campanas/${slug}/reportar`)}`)
      return
    }

    const trimmed = details.trim()
    const next: { details?: string } = {}
    if (trimmed.length < DETAILS_MIN) {
      next.details = `Describe el motivo con al menos ${DETAILS_MIN} caracteres`
    } else if (trimmed.length > DETAILS_MAX) {
      next.details = `Máximo ${DETAILS_MAX} caracteres`
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await fraudService.report(userId, {
        campaignId: campaign.id,
        reason,
        details: trimmed,
      })
      toast.success('Reporte enviado. Nuestro equipo lo revisará.')
      router.push(`/campanas/${slug}`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos enviar el reporte'
      toast.error(message)
      setSubmitting(false)
    }
  }

  const selectedReason = REASON_OPTIONS.find((r) => r.value === reason)

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/campanas/${slug}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a la campaña
      </Link>

      <header className="flex flex-col gap-2">
        <span className="bg-destructive/10 text-destructive inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <ShieldAlert className="size-3.5" aria-hidden="true" />
          Reporte de fraude
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Reportar campaña</h1>
        <p className="text-muted-foreground text-sm">
          Estás reportando la campaña{' '}
          <span className="text-foreground font-medium">{campaign.title}</span>. Nuestro equipo de
          moderación la revisará lo antes posible.
        </p>
      </header>

      <div className="border-border bg-muted/30 rounded-lg border px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          Para que podamos actuar, incluye el mayor detalle posible: enlaces, capturas mentales,
          fechas o cualquier evidencia relevante. Los reportes falsos pueden derivar en la
          suspensión de la cuenta.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reason">
            Motivo <span className="text-destructive">*</span>
          </Label>
          <select
            id="reason"
            className={SELECT_CLASS}
            value={reason}
            onChange={(e) => setReason(e.target.value as FraudReason)}
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {selectedReason && (
            <span className="text-muted-foreground text-xs">{selectedReason.helper}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="details">
              Detalle <span className="text-destructive">*</span>
            </Label>
            <span
              className={
                details.length > DETAILS_MAX
                  ? 'text-destructive text-xs'
                  : 'text-muted-foreground text-xs'
              }
            >
              {details.length}/{DETAILS_MAX}
            </span>
          </div>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={6}
            className={TEXTAREA_CLASS}
            placeholder="Cuéntanos qué viste y por qué crees que esta campaña debe revisarse…"
            aria-invalid={!!errors.details}
            aria-describedby={errors.details ? 'details-error' : 'details-help'}
          />
          {errors.details ? (
            <span id="details-error" className="text-destructive text-xs">
              {errors.details}
            </span>
          ) : (
            <span id="details-help" className="text-muted-foreground text-xs">
              Mínimo {DETAILS_MIN} caracteres. Tu identidad sólo es visible para los
              administradores.
            </span>
          )}
        </div>

        <footer className="border-border flex items-center justify-between gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            render={<Link href={`/campanas/${slug}`} />}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="destructive" size="sm" disabled={submitting}>
            <ShieldAlert className="size-4" aria-hidden="true" />
            {submitting ? 'Enviando…' : 'Enviar reporte'}
          </Button>
        </footer>
      </form>
    </div>
  )
}

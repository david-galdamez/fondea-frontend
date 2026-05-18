'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Campaign, UpdateVisibility } from '@/types'
import { ApiError, campaignsService, updatesService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface NewUpdateFormProps {
  campaignId: string
}

const RADIO_CLASS = 'h-4 w-4'

export function NewUpdateForm({ campaignId }: NewUpdateFormProps) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<UpdateVisibility>('public')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})

  useEffect(() => {
    let cancelled = false
    campaignsService
      .getById(campaignId)
      .then((c) => {
        if (!cancelled) {
          setCampaign(c)
          setError(false)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [campaignId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errs: { title?: string; body?: string } = {}
    if (!title.trim()) errs.title = 'Requerido'
    if (!body.trim()) errs.body = 'Requerido'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setBusy(true)
    try {
      await updatesService.create(campaignId, { title: title.trim(), body, visibility })
      toast.success('Actualización publicada')
      router.push(`/creador/campanas/${campaignId}/actualizaciones`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos publicar la actualización'
      toast.error(message)
      setBusy(false)
    }
  }

  if (error) return <ErrorState />
  if (loading || !campaign) return <PageSkeleton variant="form" />

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs">{campaign.title}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Nueva actualización</h1>
        <p className="text-muted-foreground text-sm">
          Comparte un avance, hito o mensaje con la comunidad.
        </p>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">
            Título <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            maxLength={120}
          />
          {errors.title && <span className="text-destructive text-xs">{errors.title}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="body">
            Contenido <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
          />
          {errors.body && <span className="text-destructive text-xs">{errors.body}</span>}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Visibilidad</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className={RADIO_CLASS}
            />
            Pública — visible para cualquiera en la página de la campaña
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visibility"
              value="backers_only"
              checked={visibility === 'backers_only'}
              onChange={() => setVisibility('backers_only')}
              className={RADIO_CLASS}
            />
            Solo patrocinadores — visible para quienes apoyaron la campaña
          </label>
        </fieldset>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <Button
            render={<Link href={`/creador/campanas/${campaignId}/actualizaciones`} />}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            <Send className="size-4" />
            Publicar
          </Button>
        </footer>
      </form>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { HelpCircle, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign } from '@/types'
import { ApiError, campaignsService, faqsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageSkeleton } from '@/components/common/page-skeleton'

interface FAQDraft {
  question: string
  answer: string
}

interface FAQsManagerProps {
  campaignId: string
}

export function FAQsManager({ campaignId }: FAQsManagerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [drafts, setDrafts] = useState<FAQDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([campaignsService.getById(campaignId), faqsService.listByCampaign(campaignId)])
      .then(([c, faqs]) => {
        if (cancelled) return
        setCampaign(c)
        setDrafts(faqs.map((f) => ({ question: f.question, answer: f.answer })))
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

  function addDraft() {
    setDrafts((prev) => [...prev, { question: '', answer: '' }])
  }

  function updateAt(idx: number, patch: Partial<FAQDraft>) {
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)))
  }

  function removeAt(idx: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setBusy(true)
    try {
      const valid = drafts
        .map((d) => ({ question: d.question.trim(), answer: d.answer.trim() }))
        .filter((d) => d.question && d.answer)
      await faqsService.upsert(campaignId, valid)
      toast.success('Preguntas guardadas')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos guardar las preguntas'
      toast.error(message)
    }
    setBusy(false)
  }

  if (error) return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
  if (loading || !campaign) return <PageSkeleton variant="list" />

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">{campaign.title}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Preguntas frecuentes</h1>
          <p className="text-muted-foreground text-sm">
            Resuelve dudas comunes antes de que los patrocinadores apoyen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addDraft}>
            <Plus className="size-4" />
            Agregar
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={busy}>
            <Save className="size-4" />
            Guardar
          </Button>
        </div>
      </header>

      {drafts.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Aún no agregaste preguntas"
          description="Comienza agregando una pregunta y su respuesta."
          action={
            <Button type="button" variant="outline" size="sm" onClick={addDraft}>
              <Plus className="size-4" />
              Agregar primera pregunta
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((draft, idx) => (
            <article key={idx} className="border-border bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Pregunta {idx + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeAt(idx)}
                  aria-label="Eliminar pregunta"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`faq-q-${idx}`}>Pregunta</Label>
                  <Input
                    id={`faq-q-${idx}`}
                    value={draft.question}
                    onChange={(e) => updateAt(idx, { question: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`faq-a-${idx}`}>Respuesta</Label>
                  <textarea
                    id={`faq-a-${idx}`}
                    value={draft.answer}
                    onChange={(e) => updateAt(idx, { answer: e.target.value })}
                    rows={3}
                    className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

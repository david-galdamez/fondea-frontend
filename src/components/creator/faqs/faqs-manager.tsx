'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError, faqsService } from '@/lib/api'
import type { FaqManageDto } from '@/lib/api/faqs.service'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/dates'

interface ManageFAQsProps {
  campaignId: string
}

export function ManageFAQs({ campaignId }: ManageFAQsProps) {
  const [faqs, setFaqs] = useState<FaqManageDto[]>([])
  const [loading, setLoading] = useState(true)
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    faqsService
      .listManage(campaignId)
      .then(setFaqs)
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false))
  }, [campaignId])

  function setDraft(faqId: string, value: string) {
    setAnswerDrafts((prev) => ({ ...prev, [faqId]: value }))
  }

  async function handleAnswer(faqId: string) {
    const answer = answerDrafts[faqId]?.trim()
    if (!answer) return
    setSubmitting(faqId)
    try {
      const updated = await faqsService.answer(campaignId, faqId, { answer })
      setFaqs((prev) =>
        prev.map((f) => (f.id === faqId ? { ...f, answer: updated.answer, answered: true } : f))
      )
      setAnswerDrafts((prev) => {
        const next = { ...prev }
        delete next[faqId]
        return next
      })
      toast.success('Respuesta publicada')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos publicar la respuesta.'
      toast.error(message)
    } finally {
      setSubmitting(null)
    }
  }

  async function handleDelete(faqId: string) {
    try {
      await faqsService.remove(campaignId, faqId)
      setFaqs((prev) => prev.filter((f) => f.id !== faqId))
      toast.success('Pregunta eliminada')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos eliminar la pregunta.'
      toast.error(message)
    }
  }

  if (loading) return <p className="text-muted-foreground text-sm">Cargando preguntas…</p>

  if (faqs.length === 0) {
    return (
      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">Aún no hay preguntas de patrocinadores.</p>
      </div>
    )
  }

  const pending = faqs.filter((f) => !f.answered)
  const answered = faqs.filter((f) => f.answered)

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="size-4 text-amber-500" aria-hidden="true" />
            Sin responder ({pending.length})
          </h2>
          {pending.map((faq) => (
            <article key={faq.id} className="border-border bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{faq.question}</p>
                  <p className="text-muted-foreground text-xs">
                    Por {faq.askedBy} · {formatShortDate(faq.askedAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(faq.id)}
                  aria-label="Eliminar pregunta"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <textarea
                  value={answerDrafts[faq.id] ?? ''}
                  onChange={(e) => setDraft(faq.id, e.target.value)}
                  placeholder="Escribe tu respuesta…"
                  rows={3}
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
                <Button
                  type="button"
                  size="sm"
                  className="self-end"
                  disabled={!answerDrafts[faq.id]?.trim() || submitting === faq.id}
                  onClick={() => handleAnswer(faq.id)}
                >
                  {submitting === faq.id ? 'Publicando…' : 'Publicar respuesta'}
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}

      {answered.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
            Respondidas ({answered.length})
          </h2>
          {answered.map((faq) => (
            <article
              key={faq.id}
              className="border-border bg-card rounded-lg border p-4 opacity-80"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{faq.question}</p>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  <p className="text-muted-foreground text-xs">
                    Por {faq.askedBy} · {formatShortDate(faq.askedAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(faq.id)}
                  aria-label="Eliminar pregunta"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

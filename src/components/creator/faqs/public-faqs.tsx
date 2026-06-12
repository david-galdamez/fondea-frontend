'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError, faqsService } from '@/lib/api'
import type { FaqDto } from '@/lib/api/faqs.service'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatShortDate } from '@/lib/dates'

interface CampaignFAQsProps {
  campaignId: string
}

export function CampaignFAQs({ campaignId }: CampaignFAQsProps) {
  const { session } = useSession()

  const [faqs, setFaqs] = useState<FaqDto[]>([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    faqsService
      .listPublic(campaignId)
      .then(setFaqs)
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false))
  }, [campaignId])

  async function handleAsk() {
    if (!question.trim()) return
    setSubmitting(true)
    try {
      await faqsService.ask(campaignId, { question: question.trim() })
      setQuestion('')
      toast.success('Pregunta enviada. El creador la responderá pronto.')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos enviar tu pregunta.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="size-5" aria-hidden="true" />
        Preguntas frecuentes
      </h2>

      {/* Lista pública de respondidas */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando preguntas…</p>
      ) : faqs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aún no hay preguntas respondidas.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <article key={faq.id} className="border-border rounded-lg border p-4">
              <p className="text-sm font-medium">{faq.question}</p>
              {faq.answer && <p className="text-muted-foreground mt-2 text-sm">{faq.answer}</p>}
              <p className="text-muted-foreground mt-2 text-xs">
                {faq.answeredAt
                  ? `Respondida el ${formatShortDate(faq.answeredAt)}`
                  : `Preguntada el ${formatShortDate(faq.askedAt)}`}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Formulario para hacer pregunta — solo si está autenticado */}
      {session && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-question">¿Tienes alguna pregunta?</Label>
          <div className="flex gap-2">
            <Input
              id="new-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Escribe tu pregunta…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAsk()
              }}
            />
            <Button onClick={handleAsk} disabled={submitting || !question.trim()} size="sm">
              <Send className="size-4" />
              Enviar
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

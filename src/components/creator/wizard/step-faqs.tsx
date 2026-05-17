'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardFAQDraft } from './types'

interface StepFAQsProps {
  faqs: WizardFAQDraft[]
  disabled?: boolean
  onChange: (next: WizardFAQDraft[]) => void
}

export function StepFAQs({ faqs, disabled, onChange }: StepFAQsProps) {
  function updateAt(idx: number, patch: Partial<WizardFAQDraft>) {
    onChange(faqs.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }

  function removeAt(idx: number) {
    onChange(faqs.filter((_, i) => i !== idx))
  }

  function addFAQ() {
    onChange([...faqs, { question: '', answer: '' }])
  }

  if (disabled) {
    return (
      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Guarda el borrador en los pasos anteriores para gestionar preguntas frecuentes.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Las preguntas frecuentes ayudan a resolver dudas comunes antes del apoyo.
      </p>

      {faqs.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">Aún no agregaste preguntas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
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
                    value={faq.question}
                    onChange={(e) => updateAt(idx, { question: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`faq-a-${idx}`}>Respuesta</Label>
                  <textarea
                    id={`faq-a-${idx}`}
                    value={faq.answer}
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

      <Button type="button" variant="outline" size="sm" onClick={addFAQ} className="self-start">
        <Plus className="size-4" />
        Agregar pregunta
      </Button>
    </div>
  )
}

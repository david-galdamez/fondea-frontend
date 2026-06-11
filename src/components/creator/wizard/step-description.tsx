'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardFields } from './types'

interface StepDescriptionProps {
  fields: WizardFields
  errors: Partial<Record<keyof WizardFields, string>>
  onChange: (patch: Partial<WizardFields>) => void
}

export function StepDescription({ fields, errors, onChange }: StepDescriptionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">
          Descripción <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="description"
          value={fields.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={12}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 font-mono text-sm outline-none focus-visible:ring-3"
          placeholder="Cuenta tu proyecto. Acepta markdown básico (encabezados, listas, énfasis)."
        />
        {errors.description && (
          <span className="text-destructive text-xs">{errors.description}</span>
        )}
      </div>

      {/* <div className="flex flex-col gap-1.5"> */}
      {/*   <Label htmlFor="gallery">Galería (una URL por línea)</Label> */}
      {/*   <textarea */}
      {/*     id="gallery" */}
      {/*     value={fields.gallery} */}
      {/*     onChange={(e) => onChange({ gallery: e.target.value })} */}
      {/*     rows={4} */}
      {/*     className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 font-mono text-sm outline-none focus-visible:ring-3" */}
      {/*     placeholder="https://…" */}
      {/*   /> */}
      {/* </div> */}
      {/**/}
      {/* <div className="flex flex-col gap-1.5"> */}
      {/*   <Label htmlFor="videoUrl">URL de video (opcional)</Label> */}
      {/*   <Input */}
      {/*     id="videoUrl" */}
      {/*     type="url" */}
      {/*     value={fields.videoUrl} */}
      {/*     onChange={(e) => onChange({ videoUrl: e.target.value })} */}
      {/*     placeholder="https://youtube.com/…" */}
      {/*   /> */}
      {/* </div> */}
    </div>
  )
}

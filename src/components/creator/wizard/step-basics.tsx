'use client'

import type { Category } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardFields } from './types'

const SELECT_CLASS =
  'border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface StepBasicsProps {
  fields: WizardFields
  errors: Partial<Record<keyof WizardFields, string>>
  categories: Category[]
  onChange: (patch: Partial<WizardFields>) => void
}

export function StepBasics({ fields, errors, categories, onChange }: StepBasicsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={fields.title}
          onChange={(e) => onChange({ title: e.target.value })}
          aria-invalid={!!errors.title}
          maxLength={120}
        />
        {errors.title && <span className="text-destructive text-xs">{errors.title}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="summary">
          Resumen <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="summary"
          value={fields.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          maxLength={240}
          rows={2}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
        />
        <p className="text-muted-foreground text-xs">
          {fields.summary.length}/240 — descripción breve para listas y previews.
        </p>
        {errors.summary && <span className="text-destructive text-xs">{errors.summary}</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">
            Categoría <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            className={SELECT_CLASS}
            value={fields.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            aria-invalid={!!errors.categoryId}
          >
            <option value="">Selecciona…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span className="text-destructive text-xs">{errors.categoryId}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={fields.tags}
            onChange={(e) => onChange({ tags: e.target.value })}
            placeholder="separados por coma"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">
            País <span className="text-destructive">*</span>
          </Label>
          <Input
            id="country"
            value={fields.country}
            onChange={(e) => onChange({ country: e.target.value })}
            aria-invalid={!!errors.country}
          />
          {errors.country && <span className="text-destructive text-xs">{errors.country}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={fields.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cover">URL de imagen de portada</Label>
        <Input
          id="cover"
          type="url"
          value={fields.coverImageUrl}
          onChange={(e) => onChange({ coverImageUrl: e.target.value })}
          placeholder="https://…"
        />
      </div>
    </div>
  )
}

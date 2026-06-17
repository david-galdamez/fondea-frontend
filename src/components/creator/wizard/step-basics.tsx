'use client'

import type { Category } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardFields } from './types'
import type { LocationDto } from '@/lib/api/locations.service'

const SELECT_CLASS =
  'border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface StepBasicsProps {
  fields: WizardFields
  errors: Partial<Record<keyof WizardFields, string>>
  categories: Category[]
  locations: LocationDto[]
  onChange: (patch: Partial<WizardFields>) => void
}

export function StepBasics({ fields, errors, categories, locations, onChange }: StepBasicsProps) {
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">
            País <span className="text-destructive">*</span>
          </Label>
          <select
            id="country"
            className={SELECT_CLASS}
            value={fields.locationId}
            onChange={(e) => onChange({ locationId: e.target.value })}
            aria-invalid={!!errors.locationId}
          >
            <option value="">Selecciona…</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.country}
              </option>
            ))}
          </select>
          {errors.locationId && (
            <span className="text-destructive text-xs">{errors.locationId}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">
            Ciudad <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={fields.city}
            onChange={(e) => onChange({ city: e.target.value })}
            aria-invalid={!!errors.city}
          />
          {errors.city && <span className="text-destructive text-xs">{errors.city}</span>}
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

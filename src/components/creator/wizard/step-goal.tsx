'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_CAMPAIGN_DURATION_DAYS, MIN_CAMPAIGN_DURATION_DAYS } from '@/lib/constants'
import type { WizardFields } from './types'

interface StepGoalProps {
  fields: WizardFields
  errors: Partial<Record<keyof WizardFields, string>>
  onChange: (patch: Partial<WizardFields>) => void
}

export function StepGoal({ fields, errors, onChange }: StepGoalProps) {
  const closeDate = computeCloseDate(fields.durationDays)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-1.5">
        <input
          id="goalType"
          type="checkbox"
          className="accent-primary h-4 w-4 cursor-pointer"
          checked={fields.isFlexibleGoal}
          onChange={(e) => onChange({ isFlexibleGoal: e.target.checked })}
        />
        <Label htmlFor="goalType">
          Meta flexible <span className="text-destructive">*</span>
        </Label>
      </div>
      <p className="text-muted-foreground text-xs">
        {!fields.isFlexibleGoal
          ? 'Solo se cobra a los patrocinadores si alcanzas la meta antes del cierre.'
          : 'Recibes lo recaudado aunque no alcances la meta.'}
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goalAmount">
          Meta (USD) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="goalAmount"
          type="number"
          min={1}
          step="0.01"
          value={fields.goalAmount}
          onChange={(e) => onChange({ goalAmount: e.target.value })}
          aria-invalid={!!errors.goalAmount}
        />
        {errors.goalAmount && <span className="text-destructive text-xs">{errors.goalAmount}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="duration">
          Duración (días) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="duration"
          type="number"
          min={MIN_CAMPAIGN_DURATION_DAYS}
          max={MAX_CAMPAIGN_DURATION_DAYS}
          value={fields.durationDays}
          onChange={(e) => {
            const durationDays = Number(e.target.value)
            onChange({ durationDays, deadline: computeCloseDate(durationDays) })
          }}
          aria-invalid={!!errors.durationDays}
        />
        <p className="text-muted-foreground text-xs">
          Entre {MIN_CAMPAIGN_DURATION_DAYS} y {MAX_CAMPAIGN_DURATION_DAYS} días. La campaña cerrará{' '}
          <span className="text-foreground font-medium">{closeDate}</span>.
        </p>
        {errors.durationDays && (
          <span className="text-destructive text-xs">{errors.durationDays}</span>
        )}
      </div>
    </div>
  )
}

export function computeCloseDate(durationDays: number): string {
  if (!durationDays || durationDays <= 0) return 'cuando definas la duración'
  const d = new Date()
  d.setDate(d.getDate() + durationDays)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

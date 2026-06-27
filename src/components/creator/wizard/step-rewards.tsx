'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardRewardDraft } from './types'

interface StepRewardsProps {
  rewards: WizardRewardDraft[]
  disabled?: boolean
  onChange: (next: WizardRewardDraft[]) => void
}

export function StepRewards({ rewards, disabled, onChange }: StepRewardsProps) {
  function updateAt(idx: number, patch: Partial<WizardRewardDraft>) {
    onChange(rewards.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function removeAt(idx: number) {
    onChange(rewards.filter((_, i) => i !== idx))
  }

  function addReward() {
    onChange([
      ...rewards,
      { title: '', description: '', minAmount: '', estimatedDelivery: '', stock: '' },
    ])
  }

  if (disabled) {
    return (
      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Guarda el borrador en los pasos anteriores para gestionar recompensas.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Las recompensas son opcionales. Cada una define un monto mínimo de apoyo.
      </p>

      {rewards.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">Aún no agregaste recompensas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rewards.map((reward, idx) => (
            <article key={idx} className="border-border bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Recompensa {idx + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeAt(idx)}
                  aria-label="Eliminar recompensa"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`reward-title-${idx}`}>Título</Label>
                  <Input
                    id={`reward-title-${idx}`}
                    value={reward.title}
                    onChange={(e) => updateAt(idx, { title: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`reward-desc-${idx}`}>Descripción</Label>
                  <textarea
                    id={`reward-desc-${idx}`}
                    value={reward.description}
                    onChange={(e) => updateAt(idx, { description: e.target.value })}
                    rows={3}
                    className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`reward-amount-${idx}`}>Monto mínimo (USD)</Label>
                    <Input
                      id={`reward-amount-${idx}`}
                      type="number"
                      min={1}
                      step="0.01"
                      value={reward.minAmount}
                      onChange={(e) => updateAt(idx, { minAmount: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`reward-delivery-${idx}`}>Entrega estimada</Label>
                    <Input
                      id={`reward-delivery-${idx}`}
                      type="date"
                      value={reward.estimatedDelivery}
                      onChange={(e) => updateAt(idx, { estimatedDelivery: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`reward-stock-${idx}`}>Stock (opcional)</Label>
                    <Input
                      id={`reward-stock-${idx}`}
                      type="number"
                      min={1}
                      value={reward.stock}
                      onChange={(e) => updateAt(idx, { stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addReward} className="self-start">
        <Plus className="size-4" />
        Agregar recompensa
      </Button>
    </div>
  )
}

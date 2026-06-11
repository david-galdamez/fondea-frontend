'use client'

import type { Category } from '@/types'
import { dollarsToMoney } from '@/lib/wizard-helpers'
import { MoneyDisplay } from '@/components/common/money-display'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import type { WizardFAQDraft, WizardFields, WizardRewardDraft } from './types'

interface StepReviewProps {
  fields: WizardFields
  rewards: WizardRewardDraft[]
  faqs: WizardFAQDraft[]
  categories: Category[]
}

export function StepReview({ fields, rewards, faqs, categories }: StepReviewProps) {
  const category = categories.find((c) => c.id === fields.categoryId)
  const goalMoney = dollarsToMoney(fields.goalAmount || '0')
  // const galleryUrls = fields.gallery
  //   .split('\n')
  //   .map((s) => s.trim())
  //   .filter(Boolean)

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Resumen</h3>
        <DataRow label="Título" value={fields.title || '—'} />
        <DataRow label="Categoría" value={category?.name ?? '—'} />
        <DataRow
          label="Ubicación"
          value={fields.city || '—'}
        />
      </div>

      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Meta y plazo</h3>
        <DataRow
          label="Tipo"
          value={!fields.isFlexibleGoal ? 'Fija (todo o nada)' : 'Flexible'}
        />
        <DataRow label="Meta" value={<MoneyDisplay value={goalMoney} />} />
        <DataRow label="Duración" value={`${fields.durationDays} días`} />
        <CampaignProgress
          raised={{ amount: 0, currency: 'USD' }}
          goal={goalMoney}
          backersCount={0}
          size="sm"
        />
      </div>

      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Descripción</h3>
        <pre className="text-muted-foreground max-h-64 overflow-auto whitespace-pre-wrap text-sm">
          {fields.description || '—'}
        </pre>
        {/* {fields.videoUrl && ( */}
        {/*   <p className="text-muted-foreground text-xs">Video: {fields.videoUrl}</p> */}
        {/* )} */}
        {/* {galleryUrls.length > 0 && ( */}
        {/*   <p className="text-muted-foreground text-xs">{galleryUrls.length} imágenes en galería</p> */}
        {/* )} */}
      </div>

      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-base font-semibold">
          Recompensas <span className="text-muted-foreground font-normal">({rewards.length})</span>
        </h3>
        {rewards.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin recompensas — solo donación libre.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rewards.map((r, idx) => (
              <li key={idx} className="text-sm">
                <span className="font-medium">{r.title || `Recompensa ${idx + 1}`}</span> · desde{' '}
                <MoneyDisplay value={dollarsToMoney(r.minAmount || '0')} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-base font-semibold">
          Preguntas <span className="text-muted-foreground font-normal">({faqs.length})</span>
        </h3>
        {faqs.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin preguntas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {faqs.map((f, idx) => (
              <li key={idx} className="text-sm">
                <span className="font-medium">{f.question || `Pregunta ${idx + 1}`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

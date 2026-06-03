'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types'
import { ApiError, campaignsService, rewardsService } from '@/lib/api'
import type { RegisterCampaignRequest } from '@/lib/api/campaigns.service'
import type { CreateRewardRequest } from '@/lib/api/rewards.service'
import { MAX_CAMPAIGN_DURATION_DAYS, MIN_CAMPAIGN_DURATION_DAYS } from '@/lib/constants'
import { dollarsToCents } from '@/lib/wizard-helpers'
import { Button } from '@/components/ui/button'
import { Stepper } from './stepper'
import { computeCloseDate, StepGoal } from './step-goal'
import { StepBasics } from './step-basics'
import { StepDescription } from './step-description'
import { StepRewards } from './step-rewards'
import { StepFAQs } from './step-faqs'
import { StepReview } from './step-review'
import {
  STEP_LABELS,
  TOTAL_STEPS,
  type WizardFAQDraft,
  type WizardFields,
  type WizardRewardDraft,
} from './types'
import type { Location } from '@/types/campaign'
import { locationServices } from '@/lib/api/locations.service'
import { categoriesService } from '@/lib/api/categories.service'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CampaignWizardProps {
  initial: {
    campaignId: string
    fields: WizardFields
    rewards: WizardRewardDraft[]
    status: string
  } | null
  initialStep?: number
}

const EMPTY_FIELDS: WizardFields = {
  title: '',
  description: '',
  categoryId: '',
  locationId: '',
  city: '',
  isFlexibleGoal: false,
  goalAmount: '',
  durationDays: 30,
  deadline: computeCloseDate(30),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte durationDays a "YYYY-MM-DD" para el backend */
function toDeadline(durationDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + durationDays)
  return d.toISOString().split('T')[0]!
}

function clampStep(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.min(TOTAL_STEPS, Math.round(value)))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CampaignWizard({ initial, initialStep = 1 }: CampaignWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<number>(clampStep(initialStep))
  const [campaignId, setCampaignId] = useState<string | null>(initial?.campaignId ?? null)
  const [fields, setFields] = useState<WizardFields>(initial?.fields ?? EMPTY_FIELDS)
  const [rewards, setRewards] = useState<WizardRewardDraft[]>(initial?.rewards ?? [])
  const [faqs] = useState<WizardFAQDraft[]>([]) // FAQs omitidas del wizard por ahora
  const [errors, setErrors] = useState<Partial<Record<keyof WizardFields, string>>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [busy, setBusy] = useState(false)

  const isReadOnly =
    !!initial &&
    initial.status !== 'DRAFT' &&
    initial.status !== 'REJECTED'

  const rewardsDisabled = !campaignId

  useEffect(() => {
    categoriesService.list().then(setCategories).catch(() => setCategories([]))
    locationServices.list().then(setLocations).catch(() => setLocations([]))
  }, [])

  // ─── Fields ────────────────────────────────────────────────────────────────

  function updateFields(patch: Partial<WizardFields>) {
    setFields((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
        ; (Object.keys(patch) as (keyof WizardFields)[]).forEach((k) => delete next[k])
      return next
    })
  }

  // ─── Validation ────────────────────────────────────────────────────────────

  function validateStep(targetStep: number): boolean {
    const errs: Partial<Record<keyof WizardFields, string>> = {}
    if (targetStep === 1) {
      if (!fields.title.trim()) errs.title = 'Requerido'
      if (!fields.categoryId) errs.categoryId = 'Selecciona una categoría'
      if (!fields.locationId) errs.locationId = 'Selecciona el país'
    }
    if (targetStep === 2) {
      if (dollarsToCents(fields.goalAmount) <= 0) errs.goalAmount = 'Debe ser mayor a cero'
      if (
        fields.durationDays < MIN_CAMPAIGN_DURATION_DAYS ||
        fields.durationDays > MAX_CAMPAIGN_DURATION_DAYS
      ) {
        errs.durationDays = `Entre ${MIN_CAMPAIGN_DURATION_DAYS} y ${MAX_CAMPAIGN_DURATION_DAYS} días`
      }
    }
    if (targetStep === 3) {
      if (!fields.description.trim()) errs.description = 'Requerida'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Build request ─────────────────────────────────────────────────────────

  function buildRequest(): RegisterCampaignRequest {
    return {
      title: fields.title.trim(),
      description: fields.description,
      goalAmount: Number(fields.goalAmount),
      isFlexibleGoal: fields.isFlexibleGoal,
      deadline: toDeadline(fields.durationDays),
      categoryId: fields.categoryId,
      locationId: fields.locationId,
      city: fields.city
    }
  }

  async function persistCampaign(): Promise<string | null> {
    const body = buildRequest()
    try {
      if (campaignId) {
        await campaignsService.update(campaignId, body)
        return campaignId
      }
      const created = await campaignsService.create(body)
      setCampaignId(created.id)
      return created.id
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos guardar el borrador'
      toast.error(message)
      return null
    }
  }

  async function syncRewards(targetCampaignId: string) {
    const savedIds = new Set(rewards.filter((r) => r.id).map((r) => r.id!))

    // Obtener los que ya existen en el backend para saber cuáles borrar
    const existing = await rewardsService.getManage(targetCampaignId)
    const existingIds = new Set(existing.map((r) => r.id))

    // Eliminar los que se quitaron del wizard
    for (const id of existingIds) {
      if (!savedIds.has(id)) {
        await rewardsService.remove(targetCampaignId, id)
      }
    }

    // Crear los nuevos (sin id)
    const nextRewards: WizardRewardDraft[] = []
    for (const draft of rewards) {
      if (!draft.title.trim() || !draft.minAmount) {
        nextRewards.push(draft)
        continue
      }

      const payload: CreateRewardRequest = {
        title: draft.title.trim(),
        description: draft.description || undefined,
        minAmount: Number(draft.minAmount),
        stock: draft.stock ? Number(draft.stock) : undefined,
        estimatedDelivery: draft.estimatedDelivery || undefined,
      }

      if (draft.id && existingIds.has(draft.id)) {
        // El backend no tiene PUT en rewards por ahora, lo dejamos como está
        nextRewards.push(draft)
      } else {
        const created = await rewardsService.create(targetCampaignId, payload)
        nextRewards.push({ ...draft, id: created.id })
      }
    }

    setRewards(nextRewards)
  }

  // ─── Save draft ────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Completa al menos título y meta para guardar el borrador')
      setStep((s) => (s > 2 ? 1 : s))
      return
    }
    setBusy(true)
    const id = await persistCampaign()
    if (!id) { setBusy(false); return }
    try {
      await syncRewards(id)
      toast.success('Borrador guardado')
      if (!initial) {
        router.replace(`/creador/campanas/${id}/editar?step=${step}`)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos sincronizar las recompensas'
      toast.error(message)
    }
    setBusy(false)
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(1)) { toast.error('Revisa la información básica'); setStep(1); return }
    if (!validateStep(2)) { toast.error('Revisa la meta y plazo'); setStep(2); return }
    if (!validateStep(3)) { toast.error('Falta la descripción'); setStep(3); return }
    setBusy(true)
    const id = await persistCampaign()
    if (!id) { setBusy(false); return }
    try {
      await syncRewards(id)
      await campaignsService.submitForReview(id)
      toast.success('Campaña enviada a revisión')
      router.push('/creador/campanas')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos enviar la campaña'
      toast.error(message)
      setBusy(false)
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  function goNext() {
    if (step <= 3 && !validateStep(step)) return
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1))
  }

  function goToStep(target: number) {
    setStep(clampStep(target))
  }

  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => ({
    number: i + 1,
    label: STEP_LABELS[i + 1] ?? '',
  }))

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {initial ? 'Editar campaña' : 'Nueva campaña'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {initial
            ? 'Modifica los datos antes de enviar a revisión nuevamente.'
            : 'Completa el wizard para enviar tu campaña a revisión.'}
        </p>
      </header>

      <Stepper steps={steps} current={step} onStepClick={goToStep} />

      {isReadOnly && (
        <div className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 rounded-lg border px-4 py-3 text-sm">
          Esta campaña ya pasó a revisión o está activa. Solo puedes editarla si fue rechazada o
          está en borrador.
        </div>
      )}

      <section className="flex flex-col gap-4">
        {step === 1 && (
          <StepBasics
            fields={fields}
            errors={errors}
            categories={categories}
            locations={locations}
            onChange={updateFields}
          />
        )}
        {step === 2 && <StepGoal fields={fields} errors={errors} onChange={updateFields} />}
        {step === 3 && <StepDescription fields={fields} errors={errors} onChange={updateFields} />}
        {step === 4 && (
          <StepRewards rewards={rewards} disabled={rewardsDisabled} onChange={setRewards} />
        )}
        {step === 5 && (
          <StepReview fields={fields} rewards={rewards} faqs={faqs} categories={categories} />
        )}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={goBack} disabled={step === 1}>
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={busy || isReadOnly}
          >
            <Save className="size-4" />
            Guardar borrador
          </Button>
          {step < TOTAL_STEPS ? (
            <Button type="button" size="sm" onClick={goNext} disabled={busy}>
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={handleSubmit} disabled={busy || isReadOnly}>
              <Send className="size-4" />
              Enviar a revisión
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign, CampaignDraft, Category, FAQ, Reward } from '@/types'
import {
  ApiError,
  campaignsService,
  categoriesService,
  faqsService,
  rewardsService,
} from '@/lib/api'
import { MAX_CAMPAIGN_DURATION_DAYS, MIN_CAMPAIGN_DURATION_DAYS } from '@/lib/constants'
import { centsToDollarsString, dollarsToCents, dollarsToMoney } from '@/lib/wizard-helpers'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Stepper } from './stepper'
import { StepBasics } from './step-basics'
import { StepGoal } from './step-goal'
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

interface CampaignWizardProps {
  initial: {
    campaign: Campaign
    rewards: Reward[]
    faqs: FAQ[]
  } | null
  initialStep?: number
}

const EMPTY_FIELDS: WizardFields = {
  title: '',
  summary: '',
  description: '',
  categoryId: '',
  city: '',
  country: '',
  tags: '',
  goalType: 'fixed',
  goalAmount: '',
  durationDays: 30,
  coverImageUrl: '',
  gallery: '',
  videoUrl: '',
}

export function CampaignWizard({ initial, initialStep = 1 }: CampaignWizardProps) {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id

  const [step, setStep] = useState<number>(clampStep(initialStep))
  const [campaignId, setCampaignId] = useState<string | null>(initial?.campaign.id ?? null)
  const [fields, setFields] = useState<WizardFields>(() =>
    initial ? toFields(initial.campaign) : EMPTY_FIELDS
  )
  const [rewards, setRewards] = useState<WizardRewardDraft[]>(() =>
    initial ? initial.rewards.map(toRewardDraft) : []
  )
  const [faqs, setFAQs] = useState<WizardFAQDraft[]>(() =>
    initial ? initial.faqs.map((f) => ({ question: f.question, answer: f.answer })) : []
  )
  const [originalRewardIds, setOriginalRewardIds] = useState<Set<string>>(
    () => new Set(initial?.rewards.map((r) => r.id) ?? [])
  )
  const [errors, setErrors] = useState<Partial<Record<keyof WizardFields, string>>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    categoriesService
      .list()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const isReadOnly =
    !!initial?.campaign &&
    initial.campaign.status !== 'draft' &&
    initial.campaign.status !== 'rejected'
  const rewardsDisabled = !campaignId

  function updateFields(patch: Partial<WizardFields>) {
    setFields((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      ;(Object.keys(patch) as (keyof WizardFields)[]).forEach((k) => delete next[k])
      return next
    })
  }

  function validateStep(targetStep: number): boolean {
    const errs: Partial<Record<keyof WizardFields, string>> = {}
    if (targetStep === 1) {
      if (!fields.title.trim()) errs.title = 'Requerido'
      if (!fields.summary.trim()) errs.summary = 'Requerido'
      if (!fields.categoryId) errs.categoryId = 'Selecciona una categoría'
      if (!fields.country.trim()) errs.country = 'Requerido'
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

  function buildDraft(): CampaignDraft {
    return {
      title: fields.title.trim(),
      summary: fields.summary.trim(),
      description: fields.description,
      categoryId: fields.categoryId,
      location: { city: fields.city.trim(), country: fields.country.trim() },
      tags: fields.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      goal: dollarsToMoney(fields.goalAmount),
      goalType: fields.goalType,
      durationDays: fields.durationDays,
      coverImageUrl: fields.coverImageUrl || undefined,
      gallery: fields.gallery
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      videoUrl: fields.videoUrl || undefined,
    }
  }

  async function persistDraft(): Promise<string | null> {
    if (!userId) return null
    const draft = buildDraft()
    try {
      if (campaignId) {
        await campaignsService.update(campaignId, draft)
        return campaignId
      }
      const created = await campaignsService.create(userId, draft)
      setCampaignId(created.id)
      return created.id
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos guardar el borrador'
      toast.error(message)
      return null
    }
  }

  async function syncRewards(targetCampaignId: string) {
    const surviving = new Set<string>()
    const nextDrafts: WizardRewardDraft[] = []
    for (let i = 0; i < rewards.length; i++) {
      const draft = rewards[i]!
      const payload = {
        campaignId: targetCampaignId,
        title: draft.title.trim(),
        description: draft.description,
        minAmount: dollarsToMoney(draft.minAmount || '0'),
        estimatedDelivery: draft.estimatedDelivery || undefined,
        stock: draft.stock ? Number(draft.stock) : undefined,
        shippingRegions: undefined,
        order: i,
      }
      if (!payload.title || payload.minAmount.amount <= 0) {
        nextDrafts.push(draft)
        continue
      }
      if (draft.id) {
        await rewardsService.update(draft.id, payload)
        surviving.add(draft.id)
        nextDrafts.push(draft)
      } else {
        const created = await rewardsService.create(payload)
        surviving.add(created.id)
        nextDrafts.push({ ...draft, id: created.id })
      }
    }
    for (const oldId of originalRewardIds) {
      if (!surviving.has(oldId)) {
        await rewardsService.remove(oldId)
      }
    }
    setRewards(nextDrafts)
    setOriginalRewardIds(surviving)
  }

  async function syncFAQs(targetCampaignId: string) {
    const valid = faqs
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question && f.answer)
    await faqsService.upsert(targetCampaignId, valid)
  }

  async function handleSaveDraft() {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Completa al menos título y meta para guardar el borrador')
      setStep((s) => (s > 2 ? 1 : s))
      return
    }
    setBusy(true)
    const id = await persistDraft()
    if (!id) {
      setBusy(false)
      return
    }
    try {
      await syncRewards(id)
      await syncFAQs(id)
      toast.success('Borrador guardado')
      if (!initial) {
        router.replace(`/creador/campanas/${id}/editar?step=${step}`)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos sincronizar todo'
      toast.error(message)
    }
    setBusy(false)
  }

  async function handleSubmit() {
    if (!validateStep(1)) {
      toast.error('Revisa la información básica')
      setStep(1)
      return
    }
    if (!validateStep(2)) {
      toast.error('Revisa la meta y plazo')
      setStep(2)
      return
    }
    if (!validateStep(3)) {
      toast.error('Falta la descripción')
      setStep(3)
      return
    }
    setBusy(true)
    const id = await persistDraft()
    if (!id) {
      setBusy(false)
      return
    }
    try {
      await syncRewards(id)
      await syncFAQs(id)
      await campaignsService.submitForReview(id)
      toast.success('Campaña enviada a revisión')
      router.push('/creador/campanas')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos enviar la campaña'
      toast.error(message)
      setBusy(false)
    }
  }

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
            onChange={updateFields}
          />
        )}
        {step === 2 && <StepGoal fields={fields} errors={errors} onChange={updateFields} />}
        {step === 3 && (
          <StepDescription fields={fields} errors={errors} onChange={updateFields} />
        )}
        {step === 4 && (
          <StepRewards rewards={rewards} disabled={rewardsDisabled} onChange={setRewards} />
        )}
        {step === 5 && <StepFAQs faqs={faqs} disabled={rewardsDisabled} onChange={setFAQs} />}
        {step === 6 && (
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

function clampStep(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.min(TOTAL_STEPS, Math.round(value)))
}

function toFields(campaign: Campaign): WizardFields {
  return {
    title: campaign.title,
    summary: campaign.summary,
    description: campaign.description,
    categoryId: campaign.categoryId,
    city: campaign.location.city ?? '',
    country: campaign.location.country,
    tags: campaign.tags.join(', '),
    goalType: campaign.goalType,
    goalAmount: campaign.goal.amount > 0 ? centsToDollarsString(campaign.goal.amount) : '',
    durationDays: campaign.durationDays || 30,
    coverImageUrl: campaign.coverImageUrl ?? '',
    gallery: campaign.gallery.join('\n'),
    videoUrl: campaign.videoUrl ?? '',
  }
}

function toRewardDraft(reward: Reward): WizardRewardDraft {
  return {
    id: reward.id,
    title: reward.title,
    description: reward.description,
    minAmount: centsToDollarsString(reward.minAmount.amount),
    estimatedDelivery: reward.estimatedDelivery ?? '',
    stock: reward.stock !== undefined ? String(reward.stock) : '',
  }
}

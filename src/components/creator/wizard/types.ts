import type { GoalType } from '@/types'

export interface WizardFields {
  title: string
  summary: string
  description: string
  categoryId: string
  city: string
  country: string
  tags: string
  goalType: GoalType
  goalAmount: string
  durationDays: number
  coverImageUrl: string
  gallery: string
  videoUrl: string
}

export interface WizardRewardDraft {
  id?: string
  title: string
  description: string
  minAmount: string
  estimatedDelivery: string
  stock: string
}

export interface WizardFAQDraft {
  question: string
  answer: string
}

export const STEP_LABELS: Record<number, string> = {
  1: 'Información',
  2: 'Meta',
  3: 'Descripción',
  4: 'Recompensas',
  5: 'Preguntas',
  6: 'Revisión',
}

export const TOTAL_STEPS = 6

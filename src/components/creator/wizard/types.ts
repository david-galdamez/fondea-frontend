export interface WizardFields {
  title: string
  description: string
  categoryId: string
  locationId: string
  city: string
  isFlexibleGoal: boolean
  goalAmount: string
  durationDays: number
  deadline: string
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
  5: 'Revisión',
}

export const TOTAL_STEPS = 5

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepInfo {
  number: number
  label: string
}

interface StepperProps {
  steps: StepInfo[]
  current: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol
      className="flex flex-wrap items-center gap-1 text-xs sm:gap-2 sm:text-sm"
      aria-label="Pasos"
    >
      {steps.map((step, idx) => {
        const isCurrent = step.number === current
        const isDone = step.number < current
        const isClickable = !!onStepClick && step.number <= current
        return (
          <li key={step.number} className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.number)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors',
                isCurrent && 'bg-primary/10 text-primary',
                !isCurrent && isDone && 'text-foreground',
                !isCurrent && !isDone && 'text-muted-foreground',
                isClickable && 'hover:bg-muted cursor-pointer',
                !isClickable && 'cursor-default'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'grid size-5 place-items-center rounded-full text-[0.7rem] font-semibold',
                  isCurrent && 'bg-primary text-primary-foreground',
                  isDone && 'bg-emerald-500 text-white',
                  !isCurrent && !isDone && 'bg-muted text-muted-foreground'
                )}
              >
                {isDone ? <Check className="size-3" aria-hidden="true" /> : step.number}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <span className="bg-border h-px w-3 sm:w-6" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

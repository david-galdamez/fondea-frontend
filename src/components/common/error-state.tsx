'use client'

import { AlertOctagon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'No pudimos cargar la información',
  description = 'Ocurrió un error inesperado. Intenta de nuevo.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center gap-2 rounded-lg border px-6 py-10 text-center',
        className
      )}
      role="alert"
    >
      <AlertOctagon className="text-destructive size-7" aria-hidden="true" />
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-muted-foreground max-w-md text-sm">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Reintentar
        </Button>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground text-sm font-medium">Algo salió mal</p>
        <h1 className="text-3xl font-semibold tracking-tight">No pudimos cargar esta página</h1>
        <p className="text-muted-foreground">
          Ocurrió un error inesperado. Intenta de nuevo o vuelve más tarde.
        </p>
        <Button onClick={reset} className="mt-2">
          Reintentar
        </Button>
      </div>
    </div>
  )
}

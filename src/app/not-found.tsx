import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground text-sm font-medium">Error 404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="text-muted-foreground">
          La página que buscas no existe o se movió. Vuelve al inicio para seguir explorando.
        </p>
        <Button render={<Link href="/" />} className="mt-2">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

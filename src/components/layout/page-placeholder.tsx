import type { ReactNode } from 'react'

interface PagePlaceholderProps {
  title: string
  description?: string
  phase?: string
  children?: ReactNode
}

export function PagePlaceholder({
  title,
  description,
  phase = 'Pantalla en construcción',
  children,
}: PagePlaceholderProps) {
  return (
    <section className="flex flex-col gap-3 py-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
      <div className="border-border bg-muted/30 mt-6 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">{phase}</p>
      </div>
      {children}
    </section>
  )
}

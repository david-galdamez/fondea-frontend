import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type Variant = 'summary' | 'list' | 'detail' | 'form'

interface PageSkeletonProps {
  variant?: Variant
  className?: string
}

interface RowsSkeletonProps {
  count?: number
  rowHeight?: string
  className?: string
}

export function RowsSkeleton({ count = 4, rowHeight = 'h-16', className }: RowsSkeletonProps) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn(rowHeight, 'w-full')} />
      ))}
    </div>
  )
}

export function PageSkeleton({ variant = 'list', className }: PageSkeletonProps) {
  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando…</span>
      {variant === 'summary' && <SummarySkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'form' && <FormSkeleton />}
    </div>
  )
}

function HeaderBlock() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-1/2 max-w-sm" />
    </div>
  )
}

function SummarySkeleton() {
  return (
    <>
      <HeaderBlock />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </>
  )
}

function ListSkeleton() {
  return (
    <>
      <HeaderBlock />
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </>
  )
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-28" />
      <HeaderBlock />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </>
  )
}

function FormSkeleton() {
  return (
    <>
      <HeaderBlock />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="h-8 w-32 self-end" />
    </>
  )
}

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Category } from '@/lib/api/categories.service'

interface CategoryBadgeProps {
  category: Pick<Category, 'name' | 'id'>
  href?: string
  className?: string
}

export function CategoryBadge({ category, href, className }: CategoryBadgeProps) {
  const targetHref = href ?? `/categorias/${category.id}`
  const classes = cn(
    'border-border text-muted-foreground hover:bg-muted inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition-colors',
    className
  )
  return (
    <Link href={targetHref} className={classes}>
      {category.name}
    </Link>
  )
}

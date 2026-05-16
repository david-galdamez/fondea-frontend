import type { User } from '@/types'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatarUrl'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASS = {
  sm: 'size-7 text-xs',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium',
        SIZE_CLASS[size],
        className
      )}
      aria-hidden="true"
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span>{initials(user.name)}</span>
      )}
    </span>
  )
}

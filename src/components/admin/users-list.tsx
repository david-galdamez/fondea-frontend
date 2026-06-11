'use client'

import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import type { Role, User } from '@/types'
import { usersService } from '@/lib/api'
import { ROLE_LABEL } from '@/lib/auth-routing'
import { formatShortDate } from '@/lib/dates'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { RowsSkeleton } from '@/components/common/page-skeleton'

const SELECT_CLASS =
  'border-input bg-background h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const ROLE_OPTIONS: { value: Role | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'ADMIN', label: 'Administradores' },
  { value: 'CREATOR', label: 'Creadores' },
  { value: 'SPONSOR', label: 'Patrocinadores' },
]

const ROLE_CLASSES: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200',
  CREATOR: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  SPONSOR: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
}

export function UsersList() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')

  useEffect(() => {
    let cancelled = false
    usersService
      .list()
      .then((items) => {
        if (cancelled) return
        setUsers(items)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [retryKey])

  const visible = useMemo(() => {
    if (!users) return []
    // ← role en lugar de roles.includes
    const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users
    return filtered;
  }, [users, roleFilter])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground text-sm">
          Listado de los usuarios registrados en la plataforma.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <Label htmlFor="role-filter" className="text-xs">
          Rol
        </Label>
        <select
          id="role-filter"
          className={SELECT_CLASS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
      ) : loading || !users ? (
        <RowsSkeleton count={5} />
      ) : visible.length === 0 ? (
        <EmptyState icon={Users} title="Sin usuarios para mostrar" />
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((u) => (
            <article
              key={u.id}
              className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
            >
              <div className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-full">
                <span className="text-xs font-semibold">{initials(u.name)}</span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="text-muted-foreground truncate text-xs">{u.email}</p>
              </div>

              {/* ← un solo badge en lugar de u.roles.map */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_CLASSES[u.role]}`}
              >
                {ROLE_LABEL[u.role]}
              </span>

              <span className="text-muted-foreground hidden text-xs sm:inline">
                Desde {formatShortDate(u.createdAt)}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
function initials(name: string): string {

  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

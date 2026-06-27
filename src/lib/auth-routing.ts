import type { Role, User } from '@/types'

/**
 * Devuelve la ruta del panel "primario" del usuario según prioridad fija:
 * admin > creator > backer.
 */
export function getPrimaryPath(user: Pick<User, 'role'>): string {
  if (user.role === 'ADMIN') return '/admin'
  if (user.role === 'CREATOR') return '/creador'
  return '/dashboard'
}

/**
 * Mapeo de rol → URL home del panel correspondiente.
 */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: '/admin',
  CREATOR: '/creador',
  SPONSOR: '/dashboard',
}

/**
 * Etiqueta legible (UI en español) para cada rol.
 */
export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  CREATOR: 'Creador',
  SPONSOR: 'Patrocinador',
}

/**
 * Determina qué rol exige una ruta dada. Devuelve `null` si la ruta sólo
 * requiere autenticación (no un rol específico).
 */
export function requiredRoleForPath(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'ADMIN'
  if (pathname.startsWith('/creador')) return 'CREATOR'
  return null
}

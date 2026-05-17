import type { Role, User } from '@/types'

/**
 * Devuelve la ruta del panel "primario" del usuario según prioridad fija:
 * admin > creator > backer.
 */
export function getPrimaryPath(user: Pick<User, 'roles'>): string {
  if (user.roles.includes('admin')) return '/admin'
  if (user.roles.includes('creator')) return '/creador'
  return '/dashboard'
}

/**
 * Mapeo de rol → URL home del panel correspondiente.
 */
export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  creator: '/creador',
  backer: '/dashboard',
}

/**
 * Etiqueta legible (UI en español) para cada rol.
 */
export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  creator: 'Creador',
  backer: 'Patrocinador',
}

/**
 * Determina qué rol exige una ruta dada. Devuelve `null` si la ruta sólo
 * requiere autenticación (no un rol específico).
 */
export function requiredRoleForPath(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/creador')) return 'creator'
  return null
}

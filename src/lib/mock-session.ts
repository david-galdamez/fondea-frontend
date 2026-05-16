import type { Role, User } from '@/types'

/**
 * Placeholder sesión usada por los layouts autenticados durante la fase 2.
 * Sustituir por el resultado de `authService.getCurrentSession()` cuando
 * llegue la fase 3 (auth mock).
 */
export const MOCK_USER: User = {
  id: 'usr-creator-1',
  email: 'carla@fondea.app',
  name: 'Carla Creadora',
  roles: ['creator', 'backer'],
  location: { city: 'Ciudad de México', country: 'México' },
  bio: 'Diseñadora industrial trabajando en productos sostenibles.',
  avatarUrl: 'https://i.pravatar.cc/150?u=creator1',
  verifiedAt: '2024-09-15T10:00:00.000Z',
  isNewCreator: false,
  campaignsCount: 3,
  pledgesCount: 4,
  createdAt: '2024-09-15T10:00:00.000Z',
}

export const MOCK_ADMIN: User = {
  id: 'usr-admin-1',
  email: 'admin@fondea.app',
  name: 'Ada Admin',
  roles: ['admin'],
  avatarUrl: 'https://i.pravatar.cc/150?u=admin1',
  createdAt: '2024-09-15T10:00:00.000Z',
}

export function userForRole(role: Role): User {
  return role === 'admin' ? MOCK_ADMIN : MOCK_USER
}

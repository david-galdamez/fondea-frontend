import type { Category } from '@/types'

export const SEED_CATEGORIES: readonly Category[] = [
  { id: 'cat-tech', slug: 'tecnologia', name: 'Tecnología', icon: 'cpu' },
  { id: 'cat-art', slug: 'arte', name: 'Arte y diseño', icon: 'palette' },
  { id: 'cat-community', slug: 'comunidad', name: 'Comunidad', icon: 'users' },
  { id: 'cat-edu', slug: 'educacion', name: 'Educación', icon: 'graduation-cap' },
  { id: 'cat-env', slug: 'medio-ambiente', name: 'Medio ambiente', icon: 'leaf' },
] as const

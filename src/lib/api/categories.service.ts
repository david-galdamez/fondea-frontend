import type { Category } from '@/types'
import { simulateNetwork } from './client'
import { NotFoundError } from './errors'
import { categoriesStore } from './_stores'

export const categoriesService = {
  async list(): Promise<Category[]> {
    await simulateNetwork()
    return categoriesStore.all()
  },

  async getBySlug(slug: string): Promise<Category> {
    await simulateNetwork()
    const cat = categoriesStore.find((c) => c.slug === slug)
    if (!cat) throw new NotFoundError('Categoría')
    return cat
  },
}

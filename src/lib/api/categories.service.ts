import type { Category } from '@/types'
import { api } from '../client';

export const categoriesService = {
  async list(): Promise<Category[]> {

    const categories = await api.get<Category[]>('/api/categories')

    return categories;
  },
}

import { api } from '../client';

export interface Category {
  id: string
  name: string
}

export const categoriesService = {
  async list(): Promise<Category[]> {

    const categories = await api.get<Category[]>('/api/categories')

    return categories;
  },
}

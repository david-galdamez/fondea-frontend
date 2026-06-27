import { api } from '../client'

export interface LocationDto {
  id: string
  country: string
  city: string
}

export const locationServices = {
  async list(): Promise<LocationDto[]> {
    const locations = await api.get<LocationDto[]>('/api/locations')
    return locations
  },
}

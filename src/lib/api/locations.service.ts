import { Location } from '@/types/campaign';
import { api } from '../client';

export const locationServices = {
  async list(): Promise<Location[]> {

    const locations = await api.get<Location[]>('/api/locations')

    return locations;
  },
}

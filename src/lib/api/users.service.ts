import type { Role, User } from '@/types'
import { simulateNetwork } from './client'
import { NotFoundError } from './errors'
import { usersStore } from './_stores'
import { api } from '../client';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
}

export type UpdateUserPatch = Partial<Pick<User, 'name' | 'city' | 'country' | 'bio'>>

export const usersService = {
  async getById(id: string): Promise<User> {
    await simulateNetwork()
    const user = usersStore.findById(id)
    if (!user) throw new NotFoundError('Usuario')
    return user
  },

  async list(): Promise<User[]> {
    await simulateNetwork()
    return usersStore.all()
  },

  async updateProfile(patch: UpdateUserPatch): Promise<User> {
    const res = await api.put<UserDto>('/api/auth/update-profile', patch)
    const user: User = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role,
      isVerified: res.isVerified,
      createdAt: res.createdAt
    }
    return user;
  },
}

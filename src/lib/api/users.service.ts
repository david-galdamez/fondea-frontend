import type { ID, User } from '@/types'
import { simulateNetwork } from './client'
import { NotFoundError } from './errors'
import { usersStore } from './_stores'

export type UpdateUserPatch = Partial<Pick<User, 'name' | 'avatarUrl' | 'location' | 'bio'>>

export const usersService = {
  async getById(id: ID): Promise<User> {
    await simulateNetwork()
    const user = usersStore.findById(id)
    if (!user) throw new NotFoundError('Usuario')
    return user
  },

  async list(): Promise<User[]> {
    await simulateNetwork()
    return usersStore.all()
  },

  async updateProfile(id: ID, patch: UpdateUserPatch): Promise<User> {
    await simulateNetwork()
    const updated = usersStore.update(id, patch)
    if (!updated) throw new NotFoundError('Usuario')
    return updated
  },
}

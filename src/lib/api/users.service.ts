import type { Role, User } from '@/types'
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

function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    isVerified: dto.isVerified,
    createdAt: dto.createdAt,
  }
}

export const usersService = {
  async getById(id: string): Promise<User> {
    const dto = await api.get<UserDto>(`/api/users/${id}`)
    return mapUser(dto)
  },

  async list(): Promise<User[]> {
    const dtos = await api.get<UserDto[]>('/api/users')
    return dtos.map(mapUser)
  },

  async updateProfile(patch: UpdateUserPatch): Promise<User> {
    const res = await api.put<UserDto>('/api/auth/update-profile', patch)
    return mapUser(res)
  },
}

import type { ISODateString, Role, Session, User } from '@/types'
import { api, tokenStore } from '../client';

const SESSION_TTL_HOU = 2

function buildSession(user: User, token: string): Session {
  const expires = new Date()
  expires.setTime(expires.getTime() + SESSION_TTL_HOU * 60 * 60 * 1000)
  return {
    user,
    token: token,
    expiresAt: expires.toISOString() as ISODateString,
  }
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface LoginResponse {
  token: string
  id: string
  name: string
  email: string
  role: Role
}

export const authService = {
  async login(input: LoginInput): Promise<Session> {
    const res = await api.post<LoginResponse>('/api/auth/login', input)

    const user: User = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role
    }
    tokenStore.set(res.token);
    return buildSession(user, res.token);
  },

  async registerCreator(input: RegisterInput): Promise<Session> {
    const res = await api.post<LoginResponse>('/api/auth/register-creator', input)
    const user: User = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role
    }
    tokenStore.set(res.token)
    return buildSession(user, res.token)
  },

  async registerSponsor(input: RegisterInput): Promise<Session> {
    const res = await api.post<LoginResponse>('/api/auth/register-sponsor', input)
    const user: User = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role
    }
    tokenStore.set(res.token)
    return buildSession(user, res.token)
  },

  async logout(): Promise<void> {
    tokenStore.clear()
  },

  async getCurrentSession(): Promise<Session | null> {
    const token = tokenStore.get()
    if (!token) return null
    const user = await api.get<User>('/api/auth/me');

    return buildSession(user, token)
  }
}

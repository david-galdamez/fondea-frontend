import type { Role, Session, User } from '@/types'
import { generateId, nowISO, readSessionRaw, simulateNetwork, writeSessionRaw } from './client'
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from './errors'
import { usersStore } from './_stores'

const SESSION_TTL_DAYS = 30

function buildSession(user: User): Session {
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_TTL_DAYS)
  return {
    user,
    token: `mock-token-${generateId()}`,
    expiresAt: expires.toISOString(),
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
  initialRole: Extract<Role, 'creator' | 'backer'>
  location?: User['location']
}

export const authService = {
  async login({ email, password }: LoginInput): Promise<Session> {
    await simulateNetwork()
    if (!email || !password) {
      throw new ValidationError('Email y contraseña son obligatorios')
    }
    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas')
    }
    const session = buildSession(user)
    writeSessionRaw(session)
    return session
  },

  async register(input: RegisterInput): Promise<Session> {
    await simulateNetwork()
    const fields: Record<string, string> = {}
    if (!input.email) fields.email = 'Requerido'
    if (!input.password) fields.password = 'Requerido'
    if (!input.name) fields.name = 'Requerido'
    if (Object.keys(fields).length > 0) {
      throw new ValidationError('Datos incompletos', fields)
    }
    if (usersStore.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ConflictError('Ya existe una cuenta con ese email')
    }
    const user: User = {
      id: generateId(),
      email: input.email,
      name: input.name,
      roles: [input.initialRole],
      location: input.location,
      isNewCreator: input.initialRole === 'creator' ? true : undefined,
      createdAt: nowISO(),
    }
    usersStore.insert(user)
    const session = buildSession(user)
    writeSessionRaw(session)
    return session
  },

  async logout(): Promise<void> {
    await simulateNetwork()
    writeSessionRaw(null)
  },

  async getCurrentSession(): Promise<Session | null> {
    const raw = readSessionRaw<Session>()
    if (!raw) return null
    const fresh = usersStore.findById(raw.user.id)
    if (!fresh) {
      writeSessionRaw(null)
      return null
    }
    return { ...raw, user: fresh }
  },

  async addRole(role: Role): Promise<User> {
    await simulateNetwork()
    const current = readSessionRaw<Session>()
    if (!current) throw new UnauthorizedError()
    const user = usersStore.findById(current.user.id)
    if (!user) throw new NotFoundError('Usuario')
    if (user.roles.includes(role)) return user
    const updated = usersStore.update(user.id, {
      roles: [...user.roles, role],
      isNewCreator: role === 'creator' ? true : user.isNewCreator,
    })
    if (!updated) throw new NotFoundError('Usuario')
    writeSessionRaw({ ...current, user: updated })
    return updated
  },
}

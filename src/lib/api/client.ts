import type { Paginated } from '@/types'
import { ApiError, type ApiErrorCode } from './errors'

const STORAGE_PREFIX = 'fondea:mock:'

interface MockConfig {
  latencyMs: number
  failNextCall: ApiErrorCode | null
}

export const mockConfig: MockConfig = {
  latencyMs: 200,
  failNextCall: null,
}

export function setMockLatency(ms: number): void {
  mockConfig.latencyMs = Math.max(0, ms)
}

export function failNext(code: ApiErrorCode = 'api_error'): void {
  mockConfig.failNextCall = code
}

export async function simulateNetwork(): Promise<void> {
  if (mockConfig.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, mockConfig.latencyMs))
  }
  if (mockConfig.failNextCall) {
    const code = mockConfig.failNextCall
    mockConfig.failNextCall = null
    throw new ApiError(`Error simulado: ${code}`, code)
  }
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
  const safePage = Math.max(1, page)
  const safeSize = Math.max(1, pageSize)
  const total = items.length
  const start = (safePage - 1) * safeSize
  const end = start + safeSize
  return {
    items: items.slice(start, end),
    page: safePage,
    pageSize: safeSize,
    total,
    hasMore: end < total,
  }
}

export class MockStore<T extends { id: string }> {
  private items: T[]
  private readonly storageKey: string
  private readonly seed: readonly T[]

  constructor(key: string, seed: readonly T[]) {
    this.storageKey = STORAGE_PREFIX + key
    this.seed = seed
    this.items = [...seed]
    this.hydrate()
  }

  private hydrate(): void {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(this.storageKey)
      if (raw === null) {
        this.persist()
        return
      }
      const parsed = JSON.parse(raw) as T[]
      if (Array.isArray(parsed)) {
        this.items = parsed
      }
    } catch {
      this.items = [...this.seed]
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.items))
    } catch {
      // localStorage may be full or disabled — silently ignore
    }
  }

  all(): T[] {
    return [...this.items]
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate)
  }

  findById(id: string): T | undefined {
    return this.items.find((item) => item.id === id)
  }

  insert(item: T): T {
    this.items.push(item)
    this.persist()
    return item
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const idx = this.items.findIndex((item) => item.id === id)
    if (idx === -1) return undefined
    const current = this.items[idx] as T
    const next = { ...current, ...patch } as T
    this.items[idx] = next
    this.persist()
    return next
  }

  remove(id: string): boolean {
    const idx = this.items.findIndex((item) => item.id === id)
    if (idx === -1) return false
    this.items.splice(idx, 1)
    this.persist()
    return true
  }

  reset(): void {
    this.items = [...this.seed]
    this.persist()
  }
}

const SESSION_KEY = STORAGE_PREFIX + 'session'

export function readSessionRaw<T>(): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeSessionRaw<T>(value: T | null): void {
  if (typeof window === 'undefined') return
  try {
    if (value === null) {
      window.localStorage.removeItem(SESSION_KEY)
    } else {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(value))
    }
  } catch {
    // ignore
  }
}

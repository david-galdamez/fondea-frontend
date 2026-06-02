'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Role, Session, User } from '@/types'
import { authService, type LoginInput, type RegisterInput } from '@/lib/api'

interface SessionContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  signIn: (input: LoginInput) => Promise<Session>
  signUpCreator: (input: RegisterInput) => Promise<Session>
  signUpSponsor: (input: RegisterInput) => Promise<Session>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
  hasRole: (role: Role) => boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const current = await authService.getCurrentSession()
    setSession(current)
  }, [])

  useEffect(() => {
    let cancelled = false
    authService
      .getCurrentSession()
      .then((s) => {
        if (!cancelled) setSession(s)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (input: LoginInput) => {
    const s = await authService.login(input)
    setSession(s)
    return s
  }, [])

  const signUpCreator = useCallback(async (input: RegisterInput) => {
    const s = await authService.registerCreator(input)
    setSession(s)
    return s
  }, [])

  const signUpSponsor = useCallback(async (input: RegisterInput) => {
    const s = await authService.registerSponsor(input)
    setSession(s)
    return s
  }, [])

  const signOut = useCallback(async () => {
    await authService.logout()
    setSession(null)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signIn,
      signUpCreator,
      signUpSponsor,
      signOut,
      refresh,
      hasRole: (role: Role) => session?.user.role === role
    }),
    [session, isLoading, signIn, signUpCreator, signUpSponsor, signOut, refresh]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession debe usarse dentro de SessionProvider')
  }
  return ctx
}

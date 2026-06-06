'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError, ValidationError } from '@/lib/api'
import { getPrimaryPath } from '@/lib/auth-routing'
import { useSession } from '@/components/providers/session-provider'

const RESEND_COOLDOWN_SECONDS = 60

export function VerifyForm() {
  const { user, isLoading, verifyAccount, resendVerificationCode } = useSession()
  const router = useRouter()

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Sin sesión no se puede verificar (el código viaja con el token): a login.
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login?redirect=/auth/confirmar')
    }
  }, [isLoading, user, router])

  // Si ya está verificado, no tiene nada que hacer aquí.
  useEffect(() => {
    if (user?.isVerified) {
      router.replace(getPrimaryPath(user))
    }
  }, [user, router])

  // Cuenta regresiva del reenvío.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await verifyAccount(code.trim())
      toast.success('Cuenta verificada correctamente')
      router.push(user ? getPrimaryPath(user) : '/')
    } catch (err) {
      const message =
        err instanceof ValidationError || err instanceof ApiError
          ? err.message
          : 'No pudimos verificar el código. Intenta de nuevo.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setError(null)
    setResending(true)
    try {
      await resendVerificationCode()
      toast.success('Te enviamos un nuevo código a tu correo')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No pudimos reenviar el código. Intenta de nuevo.'
      setError(message)
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Confirma tu cuenta</h1>
        <p className="text-muted-foreground text-sm">
          Ingresa el código que enviamos a{' '}
          {user?.email ? (
            <span className="text-foreground font-medium">{user.email}</span>
          ) : (
            'tu correo'
          )}{' '}
          para activar tu cuenta.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Código de verificación</Label>
        <Input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ej. 123456"
          autoFocus
          aria-invalid={!!error}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting || code.trim().length === 0} className="w-full">
        {submitting ? 'Verificando…' : 'Verificar cuenta'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿No recibiste el código?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="text-foreground font-medium hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
        >
          {cooldown > 0
            ? `Reenviar en ${cooldown}s`
            : resending
              ? 'Reenviando…'
              : 'Reenviar código'}
        </button>
      </p>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Role, User } from '@/types'
import { ApiError, usersService } from '@/lib/api'
import { ROLE_LABEL } from '@/lib/auth-routing'
import { useSession } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { UserAvatar } from '@/components/layout/user-avatar'

interface FormState {
  name: string
  avatarUrl: string
  city: string
  country: string
  bio: string
}

interface FormErrors {
  name?: string
  avatarUrl?: string
  bio?: string
}

const TEXTAREA_CLASS =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3'

const BIO_LIMIT = 280

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function initialForm(user: User): FormState {
  return {
    name: user.name,
    avatarUrl: user.avatarUrl ?? '',
    city: user.location?.city ?? '',
    country: user.location?.country ?? '',
    bio: user.bio ?? '',
  }
}

export function ProfileForm() {
  const { session, isLoading } = useSession()
  if (isLoading || !session) return <PageSkeleton variant="form" />
  return <ProfileFormInner key={session.user.id} user={session.user} />
}

interface InnerProps {
  user: User
}

function ProfileFormInner({ user }: InnerProps) {
  const { refresh } = useSession()

  const [form, setForm] = useState<FormState>(() => initialForm(user))
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = 'Requerido'
    else if (form.name.trim().length < 2) next.name = 'Mínimo 2 caracteres'
    if (form.avatarUrl.trim() && !isHttpUrl(form.avatarUrl.trim())) {
      next.avatarUrl = 'Debe ser una URL válida (http o https)'
    }
    if (form.bio.length > BIO_LIMIT) next.bio = `Máximo ${BIO_LIMIT} caracteres`
    return next
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const trimmedCity = form.city.trim()
    const trimmedCountry = form.country.trim()
    const location =
      trimmedCity || trimmedCountry ? { city: trimmedCity, country: trimmedCountry } : undefined

    setSaving(true)
    try {
      await usersService.updateProfile(user.id, {
        name: form.name.trim(),
        avatarUrl: form.avatarUrl.trim() || undefined,
        location,
        bio: form.bio.trim() || undefined,
      })
      await refresh()
      toast.success('Perfil actualizado')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No pudimos guardar los cambios'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const previewUser = {
    name: form.name.trim() || user.name,
    avatarUrl: form.avatarUrl.trim() || user.avatarUrl,
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground text-sm">
          Esta información se comparte entre todos tus roles en Fondea.
        </p>
      </header>

      <section className="border-border bg-card flex items-center gap-4 rounded-lg border p-5">
        <UserAvatar user={previewUser} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-medium">{previewUser.name}</span>
          <span className="text-muted-foreground truncate text-sm">{user.email}</span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {user.roles.map((role: Role) => (
              <span
                key={role}
                className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {ROLE_LABEL[role]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            maxLength={80}
          />
          {errors.name && (
            <span id="name-error" className="text-destructive text-xs">
              {errors.name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="avatarUrl">URL de avatar</Label>
          <Input
            id="avatarUrl"
            type="url"
            placeholder="https://…"
            value={form.avatarUrl}
            onChange={(e) => setField('avatarUrl', e.target.value)}
            aria-invalid={!!errors.avatarUrl}
            aria-describedby={errors.avatarUrl ? 'avatar-error' : 'avatar-help'}
          />
          {errors.avatarUrl ? (
            <span id="avatar-error" className="text-destructive text-xs">
              {errors.avatarUrl}
            </span>
          ) : (
            <span id="avatar-help" className="text-muted-foreground text-xs">
              Pega una URL pública. Déjalo en blanco para usar tus iniciales.
            </span>
          )}
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium">Ubicación</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city" className="text-xs">
                Ciudad
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="country" className="text-xs">
                País
              </Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
                maxLength={60}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Biografía</Label>
            <span
              className={
                form.bio.length > BIO_LIMIT
                  ? 'text-destructive text-xs'
                  : 'text-muted-foreground text-xs'
              }
            >
              {form.bio.length}/{BIO_LIMIT}
            </span>
          </div>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setField('bio', e.target.value)}
            rows={4}
            className={TEXTAREA_CLASS}
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? 'bio-error' : 'bio-help'}
          />
          {errors.bio ? (
            <span id="bio-error" className="text-destructive text-xs">
              {errors.bio}
            </span>
          ) : (
            <span id="bio-help" className="text-muted-foreground text-xs">
              Cuéntale a la comunidad quién eres o qué te motiva.
            </span>
          )}
        </div>

        <footer className="border-border flex items-center justify-end gap-2 border-t pt-4">
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="size-4" aria-hidden="true" />
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </footer>
      </form>
    </div>
  )
}

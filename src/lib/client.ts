import {
  ApiError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './api/errors'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

const TOKEN_KEY = 'auth_token'

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  },
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
  path: string
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 'network_error', 0)
  }

  // Spring devuelve errores también como ApiResponse, intentamos parsear
  const body: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    data: null as T,
    message: 'Error inesperado',
    timestamp: '',
    path,
  }))

  if (!res.ok) {
    const message = body.message ?? 'Error inesperado'
    if (res.status === 400) throw new ValidationError(message)
    if (res.status === 401) throw new UnauthorizedError(message)
    if (res.status === 403) throw new ForbiddenError(message)
    if (res.status === 404) throw new NotFoundError(message)
    if (res.status === 409) throw new ConflictError(message)
    throw new ApiError('Error inesperado de servidor', 'api_error', res.status)
  }

  return body.data
}

/**
 * Descarga un archivo binario/texto del backend y dispara la descarga en el
 * navegador. A diferencia de `apiClient`, no asume una respuesta JSON, por lo que
 * sirve para endpoints de exportación (CSV, etc.).
 */
export async function downloadFile(path: string, fallbackFilename: string): Promise<void> {
  const token = tokenStore.get()

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 'network_error', 0)
  }

  if (!res.ok) {
    const message = await res.text().catch(() => '')
    if (res.status === 401) throw new UnauthorizedError(message || 'No autorizado')
    if (res.status === 403) throw new ForbiddenError(message || 'Acceso denegado')
    throw new ApiError('No se pudo generar el archivo', 'api_error', res.status)
  }

  const disposition = res.headers.get('Content-Disposition')
  const match = disposition?.match(/filename="?([^"]+)"?/i)
  const filename = match?.[1] ?? fallbackFilename

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const api = {
  get: <T>(path: string) => apiClient<T>(path),

  post: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) => apiClient<T>(path, { method: 'DELETE' }),
}

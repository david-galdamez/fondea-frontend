export type ApiErrorCode =
  | 'api_error'
  | 'not_found'
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'network_error'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number

  constructor(message: string, code: ApiErrorCode = 'api_error', status = 500) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 'not_found', 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  readonly fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'validation_error', 400)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado') {
    super(message, 'unauthorized', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message, 'forbidden', 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 'conflict', 409)
    this.name = 'ConflictError'
  }
}

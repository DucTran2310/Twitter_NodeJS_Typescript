import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { USER_MESSAGE } from '~/constants/messages.constants'

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  error?: boolean
  message: string
  status: number
  constructor({ error, message, status }: { error?: boolean; message: string; status: number }) {
    this.error = true
    this.message = message
    this.status = status
  }
}

export class UnprocessableEntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({
    error,
    message = USER_MESSAGE.VALIDATION_ERROR,
    errors
  }: {
    error?: boolean
    message?: string
    errors: ErrorType
  }) {
    super({ error, message, status: HttpStatusCode.UNPROCESSABLE_ENTITY })
    this.error = true
    this.errors = errors
  }
}

export class UnauthorizedError extends ErrorWithStatus {
  // errors: ErrorType;
}

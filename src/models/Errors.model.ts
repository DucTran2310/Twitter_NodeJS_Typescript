import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { UserMessage } from '~/constants/messages.constants'

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  error: boolean
  message: string
  status: number
  constructor({ error, message, status }: { error: boolean; message: string; status: number }) {
    this.error = error
    this.message = message
    this.status = status
  }
}

export class UnprocessableEntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({
    error,
    message = UserMessage.VALIDATION_ERROR,
    errors
  }: {
    error: boolean
    message?: string
    errors: ErrorType
  }) {
    super({ error, message, status: HttpStatusCode.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}

export class UnauthorizedError extends ErrorWithStatus {
  // errors: ErrorType;
}

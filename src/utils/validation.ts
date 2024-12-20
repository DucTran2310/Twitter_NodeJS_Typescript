import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { ErrorWithStatus, UnprocessableEntityError } from '~/models/Errors.model'

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req)
    const errors = validationResult(req)
    // Nếu không có lỗi thì next()
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()
    const unprocessableEntityError = new UnprocessableEntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      // Trả về lỗi không phải lỗi do validate
      if (msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UNPROCESSABLE_ENTITY) {
        return next(msg) // pass to default error handle
      }
      unprocessableEntityError.errors[key] = errorsObject[key]
    }
    next(unprocessableEntityError)
  }
}

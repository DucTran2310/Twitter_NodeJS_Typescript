import { NextFunction, Request, Response, ErrorRequestHandler } from 'express'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { ErrorWithStatus } from '~/models/Errors.model'
import omit from 'lodash/omit'

export const defaultErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Lưu ý kiểu trả về là `void`
  if (err instanceof ErrorWithStatus) {
    res.status(err.status || HttpStatusCode.INTERNAL_SERVER).json(omit(err, ['status']))
    return
  }

  // Đảm bảo tất cả thuộc tính của `err` đều có thể liệt kê
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(HttpStatusCode.INTERNAL_SERVER).json(err)
}

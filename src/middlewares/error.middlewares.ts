import { NextFunction, Request, Response, ErrorRequestHandler } from 'express'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { ErrorWithStatus } from '~/models/Errors.model'
import omit from 'lodash/omit'

//**omit là một hàm trong thư viện Lodash, được sử dụng để tạo ra một bản sao của đối tượng nhưng loại bỏ đi một hoặc nhiều thuộc tính cụ thể. */
//.omit(object, [paths])
export const defaultErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Lưu ý kiểu trả về là `void`
  if (err instanceof ErrorWithStatus) {
    res.status(err.status || HttpStatusCode.INTERNAL_SERVER).json(omit(err, ['status', 'stack']))
    return
  }

  // Đảm bảo tất cả thuộc tính của `err` đều có thể liệt kê
  // Đoạn mã giúp bạn làm cho tất cả các thuộc tính của đối tượng lỗi (err) có thể liệt kê được,
  // Hữu ích khi bạn muốn duyệt qua và in ra tất cả các thuộc tính của một lỗi.
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(HttpStatusCode.INTERNAL_SERVER).json(err)
}

import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ErrorWithStatus, UnprocessableEntityError } from "~/models/Errors.model";

//** */
// •	validationResult, ValidationChain: Từ thư viện express-validator, để chạy các kiểm tra xác thực và thu thập kết quả xác thực.
// •	RunnableValidationChains: Chuỗi các kiểm tra xác thực từ express-validator.
//

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    //Không có lỗi next qua middleware tiếp
    if (errors.isEmpty()) {
      return next();
    }

    const errorsObject = errors.mapped();
    console.log('VVVerrorsObject: ', errorsObject)

    res.status(400).json({errors: errorsObject})
    // const unprocessableEntityError = new UnprocessableEntityError({ errors: {} });
    // for (const key in errorsObject) {
    //   const { msg } = errorsObject[key];
    //   if (msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UNPROCESSABLE_ENTITY) {
    //     return next(msg); // pass to default error handle
    //   }
    //   unprocessableEntityError.errors[key] = errorsObject[key];
    // }
    // next(unprocessableEntityError);
  };
};
import { Request, Response, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { UserMessage } from '~/constants/messages.constants'
import { ErrorWithStatus } from '~/models/Errors.model'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'

//===================================================================================================================================//
//**Validate Schema */
// LƯU Ý KHI DÙNG trim: true thì nên để nó ở dưới tất cả mọi validation

const passwordSchema: ParamSchema = {
  isString: true,
  notEmpty: {
    errorMessage: UserMessage.PASSWORD_IS_REQUIRED
  },
  isLength: { options: { min: 6, max: 50 }, errorMessage: UserMessage.PASSWORD_LENGTH_INVALID },
  trim: true,
  isStrongPassword: {
    errorMessage: UserMessage.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
}

const confirmPasswordSchema: ParamSchema = {
  isString: true,
  notEmpty: { errorMessage: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: { options: { min: 6, max: 50 }, errorMessage: UserMessage.CONFIRM_PASSWORD_LENGTH_INVALID },
  isStrongPassword: {
    errorMessage: UserMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  trim: true,
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(UserMessage.CONFIRM_PASSWORD_INVALID)
      }

      return true
    }
  }
}

const confirmNewPasswordSchema: ParamSchema = {
  isString: true,
  notEmpty: { errorMessage: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: { options: { min: 6, max: 50 }, errorMessage: UserMessage.CONFIRM_PASSWORD_LENGTH_INVALID },
  isStrongPassword: {
    errorMessage: UserMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  trim: true,
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error(UserMessage.CONFIRM_PASSWORD_INVALID)
      }

      return true
    }
  }
}

const nameSchema: ParamSchema = {
  isString: true,
  notEmpty: {
    errorMessage: UserMessage.NAME_IS_REQUIRED
  },
  trim: true,
  isLength: { options: { min: 1, max: 100 }, errorMessage: UserMessage.NAME_LENGTH_IS_INVALID }
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: true,
  isISO8601: { options: { strict: true, strictSeparator: true } }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    }
  }
}

const userIdSchema: ParamSchema = {
  isString: true,
  trim: true,
  custom: {
    options: (values, { req }) => {
      if (!ObjectId.isValid(values)) {
        throw new ErrorWithStatus({
          message: UserMessage.USER_NOT_FOUND,
          status: HttpStatusCode.NOT_FOUND
        })
      }
    }
  }
}
//===================================================================================================================================//

//===================================================================================================================================//
//**MIDDLEWARE */

export const loginValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password'
    })
  } else {
    next() // Gọi `next` khi hợp lệ và không trả về giá trị gì
  }
}

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_INVALID
        },
        notEmpty: {
          errorMessage: UserMessage.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (values) => {
            const emailExisted = await usersService.checkEmailExist(values)
            if (emailExisted) {
              throw new Error(UserMessage.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

//===================================================================================================================================//

import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { USER_MESSAGE } from '~/constants/messages.constants'
import { ErrorWithStatus } from '~/models/Errors.model'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto.utils'
import { validate } from '~/utils/validation'

//===================================================================================================================================//
//**Validate Schema */
// LƯU Ý KHI DÙNG trim: true thì nên để nó ở dưới tất cả mọi validation

const passwordSchema: ParamSchema = {
  isString: true,
  notEmpty: {
    errorMessage: USER_MESSAGE.PASSWORD_IS_REQUIRED
  },
  isLength: { options: { min: 6, max: 50 }, errorMessage: USER_MESSAGE.PASSWORD_LENGTH_INVALID },
  trim: true,
  isStrongPassword: {
    errorMessage: USER_MESSAGE.PASSWORD_MUST_BE_STRONG,
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
  notEmpty: { errorMessage: USER_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: { options: { min: 6, max: 50 }, errorMessage: USER_MESSAGE.CONFIRM_PASSWORD_LENGTH_INVALID },
  isStrongPassword: {
    errorMessage: USER_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG,
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
        throw new Error(USER_MESSAGE.CONFIRM_PASSWORD_INVALID)
      }

      return true
    }
  }
}

const confirmNewPasswordSchema: ParamSchema = {
  isString: true,
  notEmpty: { errorMessage: USER_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: { options: { min: 6, max: 50 }, errorMessage: USER_MESSAGE.CONFIRM_PASSWORD_LENGTH_INVALID },
  isStrongPassword: {
    errorMessage: USER_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG,
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
        throw new Error(USER_MESSAGE.CONFIRM_PASSWORD_INVALID)
      }

      return true
    }
  }
}

const nameSchema: ParamSchema = {
  isString: true,
  notEmpty: {
    errorMessage: USER_MESSAGE.NAME_IS_REQUIRED
  },
  trim: true,
  isLength: { options: { min: 1, max: 100 }, errorMessage: USER_MESSAGE.NAME_LENGTH_IS_INVALID }
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
          message: USER_MESSAGE.USER_NOT_FOUND,
          status: HttpStatusCode.NOT_FOUND
        })
      }
    }
  }
}
//===================================================================================================================================//

//===================================================================================================================================//
//**MIDDLEWARE */

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_IS_INVALID
        },
        notEmpty: {
          errorMessage: USER_MESSAGE.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (values, { req }) => {
            const user = await databaseService.users.findOne({
              email: values,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT,
                status: HttpStatusCode.BAD_REQUEST
              })
            }
            if (user.verify === UserVerifyStatus.BANNED) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.USER_ACCOUNT_IS_DEACTIVATED,
                status: HttpStatusCode.BAD_REQUEST
              })
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_IS_INVALID
        },
        notEmpty: {
          errorMessage: USER_MESSAGE.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (values) => {
            const emailExisted = await usersService.checkEmailExist(values)
            if (emailExisted) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.EMAIL_ALREADY_EXISTS,
                status: HttpStatusCode.BAD_REQUEST
              })
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

import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { MESSAGE_NOT_DEFINED, USER_MESSAGE } from '~/constants/messages.constants'
import { ErrorWithStatus } from '~/models/Errors.model'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto.utils'
import { verifyToken } from '~/utils/jwt.utils'
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
            const { password } = req.body
            const user = await databaseService.users.findOne({
              email: values,
              password: hashPassword(password)
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

/**
 * Check coi có truyền authorization không?
 * Có đúng định dạng Bearer ...???
 * verify token
 */
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED
              })
            }
            const access_token = (value || '').split(' ')[1]
            const auth_type = value.split(' ')[0]
            if (!access_token || auth_type !== 'Bearer') {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.ACCESS_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED
              })
            }
            try {
              if (!process.env.JWT_SECRET_ACCESS_TOKEN) {
                throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_ACCESS_TOKEN_NOT_DEFINED)
              }
              const decoded_access_token = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN
              })
              ;(req as Request).decoded_access_token = decoded_access_token
            } catch (err) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.ACCESS_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

/**
 * Check coi có truyền refreshToken không?
 * verify refresh token
 * tìm refresh_token có trong db?
 */
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED
              })
            }
            try {
              if (!process.env.JWT_SECRET_REFRESH_TOKEN) {
                throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_REFRESH_TOKEN_NOT_DEFINED)
              }
              const [decoded_refresh_token, found_refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (!found_refresh_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              return true
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_INVALID_ERROR,
                  status: HttpStatusCode.UNAUTHORIZED
                })
              }
              if (err instanceof TokenExpiredError) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_EXPIRED,
                  status: HttpStatusCode.UNAUTHORIZED
                })
              }
              throw new ErrorWithStatus({
                message: USER_MESSAGE.REFRESH_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

/**
 * Check có truyên email_verify_token?
 * tìm coi có email_verify_token trong db chưa?
 * decoded email_verify_token
 */
export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          try {
            const result = value
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED
              })
            }
            if (!process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN) {
              throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_EMAIL_VERIFY_TOKEN_NOT_DEFINED)
            }
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN
            })
            ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            return true
          } catch (err) {
            throw new ErrorWithStatus({
              message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_INVALID,
              status: HttpStatusCode.UNAUTHORIZED
            })
          }
        }
      }
    }
  })
)

/**
 * Check có đúng định dạng email
 * Check có email cos trong DB
 */
export const forgotPasswordValidator = validate(
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
          options: async (values, {req}) => {
            const user = await databaseService.users.findOne({email: values})
            if (user === null) {
              throw new Error(USER_MESSAGE.EMAIL_DOES_NOT_EXIST)
            }
            req.user = user
          }
        }
      }
    },
    ['body']
  )
)

/**
 * Check có truyền forgot_password_token?
 * Decode forgot_password_token => check có user trong DB? => check user.forgot_password_token === forgot_password_token(request)
 */
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
            try {
              if (!process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN) {
                throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_FORGOT_PASSWORD_TOKEN_NOT_DEFINED)
              }
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
              });
              const foundUser = await databaseService.users.findOne({
                _id: new ObjectId(decoded_forgot_password_token.user_id),
              });
              if (!foundUser) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.USER_NOT_FOUND,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              if (foundUser.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
            } catch (err) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
          },
        },
      },
    },
    ["body"],
  ),
);

//===================================================================================================================================//

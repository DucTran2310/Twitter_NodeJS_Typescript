import { Router } from 'express'
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/requestHandlers'

const usersRouter = Router()

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: {email: string, password: string}
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Logout user
 * Path: /logout
 * Method: POST
 * Header: Authorization {Bearer access_token}
 * Body: {refreshToken: string}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Verify-email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Header: Authorization {Bearer access_token}
 * Body: {email-verifyToken: string}
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: When email_token expire, post API with accessToken to get new email_token
 * Path: /resend-verify-email
 * Method: POST
 * Header: Bearer accessToken
 * Body: {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: Get info user
 * Path: /me
 * Method: GET
 * Header: Bearer accessToken
 * Body: {}
 */
usersRouter.get("/me", accessTokenValidator, wrapRequestHandler(getMeController));

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: Bearer accessToken
 * Body: UserSchema
 */
usersRouter.patch("/me", accessTokenValidator, verifiedUserValidator, updateMeValidator, wrapRequestHandler(updateMeController));

export default usersRouter

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { FOLLOW_MESSAGE, USER_MESSAGE } from '~/constants/messages.constants'
import {
  FollowUserReqBodyType,
  LoginReqBodyType,
  PasswordChangeReqBodyType,
  ProfileReqParamsType,
  SignOutReqBodyType,
  SignUpReqBodyType,
  TokenPayload,
  UnFollowedReqParamsType,
  UpdateReqBodyType
} from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBodyType>, res: Response) => {
  const { user } = req
  const userId = user?._id as ObjectId
  const result = await usersService.signIn({ user_id: userId.toString(), verify: user?.verify as UserVerifyStatus })
  res.status(HttpStatusCode.CREATED).json({
    error: false,
    message: USER_MESSAGE.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, SignUpReqBodyType>, res: Response) => {
  const result = await usersService.register(req.body)
  res.status(HttpStatusCode.CREATED).json({
    error: false,
    message: USER_MESSAGE.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, SignOutReqBodyType>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.signOut(refresh_token)
  res.status(HttpStatusCode.CREATED).json(result)
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, { email_verify_token: string }>,
  res: Response
): Promise<void> => {
  // Lúc sign email token có user_id
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // Id của user trong MongoDB sẽ được indexed, nên để tối ưu nhất thì nên find theo ID
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // Nếu không tìm thấy user dựa theo id
  if (!user) {
    res.status(HttpStatusCode.NOT_FOUND).json({
      message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_INVALID
    })
  }
  // Nếu đã verify rồi (tức là email_verify_token === "")
  // Trả về status OK với message là đã verified trước đó rồi
  if (user?.email_verify_token === '') {
    res.status(HttpStatusCode.OK).json({
      message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_VERIFIED
    })
  }
  const result = await usersService.verifyEmail(user_id)
  res.status(HttpStatusCode.OK).json({
    message: USER_MESSAGE.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    res.status(HttpStatusCode.NOT_FOUND).json({
      error: true,
      message: USER_MESSAGE.USER_NOT_FOUND
    })
    return
  }

  if (user.verify === UserVerifyStatus.VERIFIED) {
    res.status(HttpStatusCode.OK).json({
      error: true,
      message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_VERIFIED
    })
    return
  }

  const result = await usersService.resendVerifyEmail(user_id)
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: 'Gửi lại email xác thực thành công',
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, { email: string }>,
  res: Response
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({ user_id: _id.toString(), verify })
  res.status(HttpStatusCode.OK).json({
    error: false,
    result
  })
  return
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, { forgot_password_token: string }>,
  res: Response
) => {
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: USER_MESSAGE.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, { password: string; confirm_password: string }>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const result = await usersService.resetPassword(user_id, req.body.password)
  res.status(HttpStatusCode.OK).json({
    message: USER_MESSAGE.CHANGE_PASSWORD_SUCCESSFULLY,
    result
  })
}

export const getMeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload
  const user = await usersService.getMe(user_id)
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: USER_MESSAGE.USER_FOUND,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateReqBodyType>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload
  const body = req.body
  const user = await usersService.updateMe(user_id, body)
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: 'Updated profile successfully',
    result: user
  })
}

export const getProfileController = async (req: Request<ProfileReqParamsType, any, any>, res: Response) => {
  const { username } = req.params
  const result = await usersService.getProfile(username)
  res.status(HttpStatusCode.OK).json(result)
}

export const followUserController = async (
  req: Request<ParamsDictionary, any, FollowUserReqBodyType>,
  res: Response
) => {
  const { user_id: current_user_id } = req.decoded_access_token as TokenPayload
  const { being_followed_user_id } = req.body
  const result = await usersService.followUser(current_user_id, being_followed_user_id)
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: FOLLOW_MESSAGE.FOLLOW_SUCCESSFULLY,
    result
  })
}

export const unFollowUserController = async (req: Request<UnFollowedReqParamsType>, res: Response) => {
  const { user_id: current_user_id } = req.decoded_access_token as TokenPayload
  const { being_followed_user_id } = req.params
  const result = await usersService.unfollowUser(current_user_id, being_followed_user_id)
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: FOLLOW_MESSAGE.UNFOLLOW_SUCCESSFULLY,
    result
  })
}

export const changePassswordController = async (
  req: Request<ParamsDictionary, any, PasswordChangeReqBodyType>,
  res: Response
) => {
  const { confirm_new_password } = req.body
  const { user_id } = req.decoded_access_token as TokenPayload
  await usersService.changePassword(user_id, confirm_new_password)
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: USER_MESSAGE.CHANGE_PASSWORD_SUCCESSFULLY
  })
}

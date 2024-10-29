import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { USER_MESSAGE } from '~/constants/messages.constants'
import { LoginReqBodyType, SignOutReqBodyType, SignUpReqBodyType, TokenPayload } from '~/models/requests/User.request'
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
  const { user_id } = req.decoded_access_token as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  
  if (!user) {
    res.status(HttpStatusCode.NOT_FOUND).json({
      error: true,
      message: USER_MESSAGE.USER_NOT_FOUND,
    });
    return;
  }

  if (user.verify === UserVerifyStatus.VERIFIED) {
    res.status(HttpStatusCode.OK).json({
      error: true,
      message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_VERIFIED,
    });
    return;
  }

  const result = await usersService.resendVerifyEmail(user_id);
  res.status(HttpStatusCode.OK).json({
    error: false,
    message: "Gửi lại email xác thực thành công",
    result,
  });
};

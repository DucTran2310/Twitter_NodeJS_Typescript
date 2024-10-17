import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { USER_MESSAGE } from '~/constants/messages.constants'
import { LoginReqBodyType, SignUpReqBodyType } from '~/models/requests/User.request'
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

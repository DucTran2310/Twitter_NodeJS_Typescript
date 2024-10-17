import { JwtPayload } from 'jsonwebtoken'
import { TokenEnum, UserVerifyStatus } from '~/constants/enums'

export type SignUpReqBodyType = {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export type TokenPayload = {
  user_id: string
  token_type: TokenEnum
  verify: UserVerifyStatus
  exp: number
  iat: number
} & JwtPayload

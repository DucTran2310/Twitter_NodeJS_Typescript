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

export type RefreshTokenPayload = {
  refresh_token: string
}

export type LoginReqBodyType = {
  email: string
  password: string
}

export type SignOutReqBodyType = {
  refresh_token: string
}

export type UpdateReqBodyType = {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export type ProfileReqParamsType = {
  username: string
}

export type FollowUserReqBodyType = {
  being_followed_user_id: string
}

export type UnFollowedReqParamsType = {
  being_followed_user_id: string
}

export type PasswordChangeReqBodyType = {
  old_password: string
  new_password: string
  confirm_new_password: string
}

import { TokenPayload } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'

export {}

declare module 'express' {
  interface Request {
    user?: User
    decoded_access_token?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}

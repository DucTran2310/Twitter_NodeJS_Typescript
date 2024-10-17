import User from '~/models/schemas/User.schema'

export {}

declare module 'express' {
  interface Request {
    user?: User
  }
}

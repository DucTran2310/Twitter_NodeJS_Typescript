import { ObjectId } from 'mongodb'
import { TokenEnum, UserVerifyStatus } from '~/constants/enums'
import { SignUpReqBodyType } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { signToken, verifyToken } from '~/utils/jwt.utils'
import { hashPassword } from '~/utils/crypto.utils'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

class UsersService {
  //==================================================================================================================================================
  //** PRIVATE */
  private onReject(err: any) {
    console.log(err)
    return err
  }

  private decodeRefreshToken(refresh_token: string) {
    if (!process.env.JWT_SECRET_REFRESH_TOKEN) {
      throw new Error('JWT_SECRET_REFRESH_TOKEN is not defined')
    }
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN
    })
  }

  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    if (!process.env.JWT_SECRET_ACCESS_TOKEN) {
      throw new Error('JWT_SECRET_ACCESS_TOKEN is not defined')
    }
    return signToken({
      payload: { user_id, token_type: TokenEnum.ACCESS_TOKEN, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (!process.env.JWT_SECRET_REFRESH_TOKEN) {
      throw new Error('JWT_SECRET_REFRESH_TOKEN is not defined')
    }
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenEnum.REFRESH_TOKEN, verify, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
        options: {
          algorithm: 'HS256'
        }
      })
    }
    return signToken({
      payload: { user_id, token_type: TokenEnum.REFRESH_TOKEN, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    if (!process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN) {
      throw new Error('JWT_SECRET_REFRESH_TOKEN is not defined')
    }
    return signToken({
      payload: { user_id, verify, token_type: TokenEnum.EMAIL_VERIFY_TOKEN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private async returnAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return await Promise.all([
      this.signAccessToken({ user_id, verify }).catch(this.onReject),
      this.signRefreshToken({ user_id, verify }).catch(this.onReject)
    ])
  }
  //==================================================================================================================================================

  async signIn({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.returnAccessAndRefreshToken({
      user_id,
      verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, created_at: new Date(), iat, exp })
    )
    return { access_token, refresh_token }
  }

  async register(payload: SignUpReqBodyType) {
    const _id = new ObjectId()
    const user_id = _id.toString()
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.UNVERIFIED })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id,
        email_verify_token,
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.returnAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.UNVERIFIED
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    if (access_token instanceof Error) {
      console.log(access_token)
    }
    if (refresh_token instanceof Error) {
      console.log(refresh_token)
    }
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        created_at: new Date(),
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
}

const usersService = new UsersService()
export default usersService

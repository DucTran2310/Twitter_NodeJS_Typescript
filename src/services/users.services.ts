import { ObjectId } from 'mongodb'
import { TokenEnum, UserVerifyStatus } from '~/constants/enums'
import { SignUpReqBodyType } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { signToken, verifyToken } from '~/utils/jwt.utils'
import { hashPassword } from '~/utils/crypto.utils'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { MESSAGE_NOT_DEFINED, USER_MESSAGE } from '~/constants/messages.constants'

class UsersService {
  //==================================================================================================================================================
  //** PRIVATE */
  private onReject(err: any) {
    console.log(err)
    return err
  }

  private decodeRefreshToken(refresh_token: string) {
    if (!process.env.JWT_SECRET_REFRESH_TOKEN) {
      throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_REFRESH_TOKEN_NOT_DEFINED)
    }
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN
    })
  }

  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    if (!process.env.JWT_SECRET_ACCESS_TOKEN) {
      throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_ACCESS_TOKEN_NOT_DEFINED)
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
      throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_REFRESH_TOKEN_NOT_DEFINED)
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
      throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_EMAIL_VERIFY_TOKEN_NOT_DEFINED)
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

  private async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    if (!process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN) {
      throw new Error(MESSAGE_NOT_DEFINED.JWT_SECRET_FORGOT_PASSWORD_TOKEN_NOT_DEFINED)
    }
    return signToken({
      payload: { user_id, verify, token_type: TokenEnum.FORGOT_PASSWORD_TOKEN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
      },
    });
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

  async signOut(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      error: false,
      message: USER_MESSAGE.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.returnAccessAndRefreshToken({
        user_id,
        verify: UserVerifyStatus.VERIFIED
      }),
      await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          //tạo giá trị cập nhật 
          // mongo cập nhật giá trị
          $set: { email_verify_token: '', verify: UserVerifyStatus.VERIFIED, updated_at: '$$NOW' }
        }
      ])
    ])
    const [access_token, refresh_token] = token
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  /**
   * Find and update email_verify_token
   */
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.UNVERIFIED,
    });
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { email_verify_token, updated_at: "$$NOW" },
      },
    ]);
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify,
    });
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { forgot_password_token, updated_at: "$$NOW" },
      },
    ]);
    // Gửi email kèm đường link tới email của user: https://domain.com/forgot-password?token=forgot_password_token
    return {
      message: USER_MESSAGE.SEND_EMAIL_FORGOT_PASSWORD_SUCCESS,
    };
  }

  async resetPassword(user_id: string, newPassword: string) {
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { 
          password: hashPassword(newPassword), 
          forgot_password_token: '' 
        },
        $currentDate: { updated_at: true },
      },
    );
    return {
      result,
    };
  }
}

const usersService = new UsersService()
export default usersService

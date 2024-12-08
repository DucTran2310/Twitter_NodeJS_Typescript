import { Router } from 'express'
import { uploadImagesController, uploadVideoHLSController, uploadVideosController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/requestHandlers'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImagesController)
)

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideosController)
)

mediasRouter.post(
  '/upload-video-hls',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

export default mediasRouter

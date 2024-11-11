import { Router } from 'express'
import { uploadImagesController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/requestHandlers'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(uploadImagesController)
)

export default mediasRouter

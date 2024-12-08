import { Router } from 'express'
import {
  getVideoStatusController,
  uploadImagesController,
  uploadVideoHLSController,
  uploadVideosController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/requestHandlers'

const mediasRouter = Router()

/**
 * Route: POST /upload-image
 * Description: Upload image(s) to server
 * Request Body: FormData with key 'image' containing image file(s)
 * Headers:
 *  - Authorization: Bearer <access_token>
 */
mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImagesController)
)

/**
 * Route: POST /upload-video
 * Description: Upload video file to server
 * Request Body: FormData with key 'video' containing video file
 * Headers:
 *  - Authorization: Bearer <access_token>
 */
mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideosController)
)

/**
 * Route: POST /upload-video-hls
 * Description: Upload and convert video to HLS format
 * Request Body: FormData with key 'video' containing video file
 * Headers:
 *  - Authorization: Bearer <access_token>
 */
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

/**
 * Route: GET /video-status/:id
 * Description: Get video status
 * Request Body: None
 * Headers:
 *  - Authorization: Bearer <access_token>
 */
mediasRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getVideoStatusController)
)

export default mediasRouter

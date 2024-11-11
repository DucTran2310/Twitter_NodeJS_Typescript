import { NextFunction, Request, Response } from 'express'
import { MEDIA_MESSAGE } from '~/constants/messages.constants'
import mediaService from '~/services/medias.services'

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediaService.handleUploadSingleImage(req)
  res.json({
    error: false,
    message: MEDIA_MESSAGE.UPLOAD_IMAGE_SUCCESSFULLY,
    result: data
  })
}

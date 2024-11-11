import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { MEDIA_MESSAGE } from '~/constants/messages.constants'
import mediaService from '~/services/medias.services'

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediaService.uploadImages(req)
  res.json({
    error: false,
    message: MEDIA_MESSAGE.UPLOAD_IMAGE_SUCCESSFULLY,
    result: data
  })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve('IMAGE_UPLOAD_DIR', name), (err) => {
    if (err) {
      res.status((err as any).status).send('NOT FOUND IMAGE')
    }
  })
}

import { NextFunction, Request, Response } from 'express'
import mediaService from '~/services/medias.services'

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediaService.handleUploadSingleImage(req)
  res.json({
    result: data
  })
}

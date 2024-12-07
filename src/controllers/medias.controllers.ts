import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { VIDEO_UPLOAD_DIR } from '~/constants/constants'
import { MEDIA_MESSAGE } from '~/constants/messages.constants'
import mediaService from '~/services/medias.services'
import fs from 'fs'

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

export const uploadVideosController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediaService.uploadVideos(req)
  res.json({
    error: false,
    message: MEDIA_MESSAGE.UPLOAD_VIDEO_SUCCESSFULLY,
    result: data
  })
}

// export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
//   const { name } = req.params
//   return res.sendFile(path.resolve(VIDEO_UPLOAD_DIR, name), (err) => {
//     if (err) {
//       res.status((err as any).status).send('NOT FOUND VIDEO')
//     }
//   })

export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const videoPath = path.resolve(VIDEO_UPLOAD_DIR, name)

  // Get video stats
  const stat = fs.statSync(videoPath)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    // Parse range
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = end - start + 1

    const stream = fs.createReadStream(videoPath, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    stream.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(200, head)
    fs.createReadStream(videoPath).pipe(res)
  }
}

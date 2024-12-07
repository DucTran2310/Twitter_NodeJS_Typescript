import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { VIDEO_UPLOAD_DIR } from '~/constants/constants'
import { MEDIA_MESSAGE } from '~/constants/messages.constants'
import mediaService from '~/services/medias.services'
import fs from 'fs'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import mime from 'mime'

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

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const videoPath = path.resolve(VIDEO_UPLOAD_DIR, name)

  // Kiểm tra file tồn tại
  if (!fs.existsSync(videoPath)) {
    return res.status(HttpStatusCode.NOT_FOUND).send('Video not found')
  }

  const videoSize = fs.statSync(videoPath)
  const fileSize = videoSize.size
  const range = req.headers.range

  if (range) {
    // Parse range header đúng format: "bytes=start-end"
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const chunkSize = 100 * 1024 * 1024 // 1MB
    const end = Math.min(start + chunkSize, fileSize - 1)

    const contentLength = end - start + 1
    const contentType = mime.getType(videoPath) || 'video/mp4'

    /**
     * Content-Range: bytes 0-99/1000
     * Accept-Ranges: bytes
     * Content-Length: {end - start + 1} ex: 0 - 99 / 100
     * Content-Type: video/mp4
     * 
     * ChunkSize = 50
     * VideoSize = 100
     * 
     * |0_________________50|51_________________99|100
     * stream 1: 0 - 50 start = 0, end = 50 contentLength = 51
     * stream 2: 51 - 99 start = 51, end = 99 contentLength = 49
     * stream 3: 100 start = 100, end = 99 contentLength = 1
     */

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    }

    res.writeHead(HttpStatusCode.PARTIAL_CONTENT, headers)
    const stream = fs.createReadStream(videoPath, { start, end })
    stream.pipe(res)
  } else {
    return res.status(HttpStatusCode.BAD_REQUEST).send('Require range header')
  }
}

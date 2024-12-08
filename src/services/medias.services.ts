import { config } from 'dotenv'
import { Request } from 'express'
import fsPromise from 'fs/promises'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { IMAGE_UPLOAD_DIR } from '~/constants/constants'
import { EncodingStatus, MediaEnum } from '~/constants/enums'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import databaseService from '~/services/database.services'
import { TMediaResponse } from '~/types/media.types'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/ffmpeg'
import { formidableImageUploadHandler, formidableVideoUploadHandler, getNameFromFullName } from '~/utils/files.utils'
config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    // item = /home/ubuntu/uploads/video/17282828282828282828282828282828.mp4

    const idName = getNameFromFullName(item.split('/').pop() as string)
    await databaseService.videoStatus.insertOne(new VideoStatus({ name: idName, status: EncodingStatus.PENDING }))

    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]

      const idName = getNameFromFullName(videoPath.split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        { $set: { status: EncodingStatus.PROCESSING }, $currentDate: { updated_at: true } }
      )

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)

        await databaseService.videoStatus.updateOne(
          { name: idName },
          { $set: { status: EncodingStatus.SUCCESS }, $currentDate: { updated_at: true } }
        )

        console.log(`Encode video ${videoPath} successfully`)
      } catch (error) {
        console.log(`Error encoding video ${videoPath} error: ${error}`)

        await databaseService.videoStatus
          .updateOne({ name: idName }, { $set: { status: EncodingStatus.FAILED }, $currentDate: { updated_at: true } })
          .catch((error) => {
            console.log(`Error updating video status ${idName} error: ${error}`)
          })
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('No more videos to encode')
    }
  }
}
const queue = new Queue()

class MediaService {
  async uploadImages(req: Request) {
    const imageFiles = await formidableImageUploadHandler(req)
    const result: TMediaResponse[] = await Promise.all(
      imageFiles.map(async (file) => {
        // const fileWithoutExtensions = getFileNameWithoutExtensions(file.newFilename);
        await sharp(file.filepath)
          .resize(1200, 1200, {
            fit: 'inside'
          })
          .jpeg({
            quality: 80
          })
          .toFile(IMAGE_UPLOAD_DIR + `/${file.newFilename}.jpg`)
        return {
          url: isProduction
            ? `${process.env.API_HOST}/static/${file.newFilename}.jpg`
            : `http://localhost:8080/static/${file.newFilename}.jpg`,
          type: MediaEnum.Image
        }
      })
    )
    return result
  }

  // Cách 1: Tạo unique id cho vide ngay từ đầu
  // Cách 2: Đợi video upload xong rồi tạo folder, move video vào

  async uploadVideos(req: Request) {
    const videoFiles = await formidableVideoUploadHandler(req)
    const { newFilename } = videoFiles[0]
    return {
      url: isProduction
        ? `${process.env.API_HOST}/static/video-stream/${newFilename}`
        : `http://localhost:8080/static/video-stream/${newFilename}`,
      type: MediaEnum.Video
    }
  }

  async uploadVideoHLS(req: Request) {
    const videoFiles = await formidableVideoUploadHandler(req)
    const result: TMediaResponse[] = await Promise.all(
      videoFiles.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.API_HOST}/static/video-hls/${newName}.m3u8`
            : `http://localhost:8080/static/video-hls/${newName}.m3u8`,
          type: MediaEnum.HLS
        }
      })
    )

    return result
  }

  async getVideoStatus(id: string) {
    const videoStatus = await databaseService.videoStatus.findOne({ name: id })
    return videoStatus
  }
}

const mediaService = new MediaService()

export default mediaService

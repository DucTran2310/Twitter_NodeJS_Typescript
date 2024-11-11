import { config } from 'dotenv'
import { Request } from 'express'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { IMAGE_UPLOAD_DIR } from '~/constants/constants'
import { MediaEnum } from '~/constants/enums'
import { TMediaResponse } from '~/types/media.types'
import { formidableImageUploadHandler } from '~/utils/files.utils'
config()
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
}

const mediaService = new MediaService()

export default mediaService

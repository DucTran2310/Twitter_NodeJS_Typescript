import { Request } from "express"
import path from "path"
import sharp from "sharp"
import { IMAGE_UPLOAD_DIR } from "~/constants/constants"
import { getNameFromFullName, handleUploadImage } from "~/utils/files.utils"
import fs from 'fs'
import { isProduction } from "~/constants/config"
import { config } from "dotenv"
config()
class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(IMAGE_UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)

    fs.unlinkSync(file.filepath)

    return isProduction ? `${process.env.HOST}/static/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/${newName}.jpg`
  }
}

const mediaService = new MediaService()

export default mediaService

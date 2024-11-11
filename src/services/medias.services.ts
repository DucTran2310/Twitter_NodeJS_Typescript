import { Request } from "express"
import path from "path"
import sharp from "sharp"
import { IMAGE_UPLOAD_DIR } from "~/constants/constants"
import { getNameFromFullName, handleUploadImage } from "~/utils/files.utils"
import fs from 'fs'
class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(IMAGE_UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)

    fs.unlinkSync(file.filepath)

    return `http://localhost:3000/uploads/${newName}.jpg`
  }
}

const mediaService = new MediaService()

export default mediaService

import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { IMAGE_UPLOAD_TEMP_DIR, VIDEO_UPLOAD_TEMP_DIR } from '~/constants/constants'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { MEDIA_MESSAGE } from '~/constants/messages.constants'

export const initFolder = () => {
  if (!fs.existsSync(IMAGE_UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(IMAGE_UPLOAD_TEMP_DIR, {
      recursive: true
    })
  }
  if (!fs.existsSync(VIDEO_UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(VIDEO_UPLOAD_TEMP_DIR, {
      recursive: true
    })
  }
  return
}

export const formidableImageUploadHandler = (req: Request) => {
  const form = formidable({
    uploadDir: IMAGE_UPLOAD_TEMP_DIR,
    allowEmptyFiles: false,
    maxFiles: 4,
    // keepExtensions: true,
    // 10 * 1024 bytes = 10KB => 10KB * 1024 bytes = 10MB
    maxFileSize: 10 * 1024 * 1024,
    // totalFileSize maximum sẽ là 40MB, tức là nếu upload nhiều ảnh một lúc thì max chỉ được là 40MB thôi
    maxTotalFileSize: 10 * 4 * 1024 * 1024,
    filter: function ({ mimetype, name, originalFilename }) {
      const isFileValid = Boolean(mimetype?.includes('image'))
      const isKeyValid = name === 'image'
      if (!isFileValid) {
        form.emit('error' as 'data', new Error('File type is not valid') as any)
      }
      if (!isKeyValid) {
        form.emit(
          'error' as 'data',
          new Error(`The key "${name}" in form-data is not valid, please replace it with "image" `) as any
        )
      }
      return isFileValid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('Can not upload empty stuffs'))
      }
      return resolve(files.image)
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const namearr = fullName.split('.')
  namearr.pop()
  return namearr.join('')
}

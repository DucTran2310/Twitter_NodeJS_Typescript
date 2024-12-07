import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { IMAGE_UPLOAD_DIR, IMAGE_UPLOAD_TEMP_DIR, VIDEO_UPLOAD_DIR, VIDEO_UPLOAD_TEMP_DIR } from '~/constants/constants'

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
    uploadDir: IMAGE_UPLOAD_DIR,
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

export const formidableVideoUploadHandler = (req: Request) => {
  const form = formidable({
    uploadDir: VIDEO_UPLOAD_DIR,
    allowEmptyFiles: false,
    maxFiles: 1,
    keepExtensions: true, // Enable this to preserve file extensions
    maxFileSize: 50 * 1024 * 1024,
    filter: function ({ mimetype, name }) {
      const isFileValid = Boolean(mimetype?.includes('video/'))
      const isKeyValid = name === 'video'

      if (!isFileValid) {
        form.emit('error' as 'data', new Error('File type is not valid. Please upload a video file.') as any)
      }
      if (!isKeyValid) {
        form.emit('error' as 'data', new Error('The key "video" is required in form-data') as any)
      }
      return isFileValid && isKeyValid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.video) {
        return reject(new Error('No video file provided'))
      }
      // Convert to array only after we've confirmed files.video exists
      const videoFiles = Array.isArray(files.video) ? files.video : [files.video]
      return resolve(videoFiles)
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const namearr = fullName.split('.')
  namearr.pop()
  return namearr.join('')
}

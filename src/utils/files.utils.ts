import { Request } from "express";
import { File } from "formidable";
import fs from "fs";
import path from "path";
import { IMAGE_UPLOAD_TEMP_DIR, VIDEO_UPLOAD_TEMP_DIR } from "~/constants/constants";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { MEDIA_MESSAGE } from "~/constants/messages.constants";

export const initFolder = () => {
  if (!fs.existsSync(IMAGE_UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(IMAGE_UPLOAD_TEMP_DIR, {
      recursive: true,
    });
  }
  if (!fs.existsSync(VIDEO_UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(VIDEO_UPLOAD_TEMP_DIR, {
      recursive: true,
    });
  }
  return;
};

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default

  const form = formidable({
    uploadDir: path.resolve(IMAGE_UPLOAD_TEMP_DIR),
    maxFiles: 1,
    keepExtensions: true, //giữ đuôi file
    maxFileSize: 300 * 1024, // 300kb
    filter: function ({name, originalFilename, mimetype}) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if(!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return valid
    }
  })

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if(!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
    
      resolve((files.image as File[])[0])
    });
  })
}

export const getNameFromFullName = (fullName: string) => {
  const namearr = fullName.split('.')
  namearr.pop()
  return namearr.join('')
}

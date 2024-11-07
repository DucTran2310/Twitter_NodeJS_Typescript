import { NextFunction, Request, Response } from 'express'
import { HttpStatusCode } from '~/constants/httpStatusCode.enum'
import { MEDIA_MESSAGE } from '~/constants/messages.constants'
import path from 'path'

console.log('PATH: ', path.resolve('uploads'))

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  // const result = await mediasServices.handleUploadImages(req);
  const formidable = (await import('formidable')).default

  //lưu vô thư mục uploads, 1 file 1 lần up, 300kb
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true, //giữ đuôi file
    maxFileSize: 300 * 1024 // 300kb
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(HttpStatusCode.INTERNAL_SERVER).json({
        message: MEDIA_MESSAGE.UPLOAD_IMAGE_FAILED,
        error: err.message // Trả lỗi cụ thể ra response (nếu cần)
      });
    }
  
    res.json({
      message: MEDIA_MESSAGE.UPLOAD_IMAGE_SUCCESSFULLY
    });
  });

  // res.status(HttpStatusCode.OK).json({
  //   message: MEDIA_MESSAGE.UPLOAD_IMAGE_SUCCESSFULLY
  //   // result,
  // })

  // res.json({
  //   message: 'ahihi'
  // })
  
}

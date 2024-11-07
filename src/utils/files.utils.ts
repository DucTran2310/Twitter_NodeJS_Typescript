import fs from "fs";
import { IMAGE_UPLOAD_TEMP_DIR, VIDEO_UPLOAD_TEMP_DIR } from "~/constants/constants";

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
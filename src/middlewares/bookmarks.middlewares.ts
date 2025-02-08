import { checkSchema } from "express-validator";
import { validate } from "~/utils/validation";
import { ObjectId } from "mongodb"; // Import ObjectId từ MongoDB

export const createBookmarkValidator = validate(
  checkSchema(
    {
      tweet_id: {
        in: ["body"], // Đảm bảo rằng tweet_id được kiểm tra trong body
        exists: {
          errorMessage: 'tweet_id is required', // Thông báo lỗi nếu không có
        },
        isString: {
          errorMessage: 'tweet_id must be a string', // Thông báo lỗi nếu không phải là chuỗi
        },
        custom: {
          options: (value) => {
            // Kiểm tra xem tweet_id có phải là một ObjectId hợp lệ không
            if (!ObjectId.isValid(value) || value.length !== 24) {
              throw new Error('tweet_id must be a valid ObjectId'); // Thông báo lỗi nếu không hợp lệ
            }
            return true; // Trả về true nếu tất cả các kiểm tra đều hợp lệ
          },
        },
      },
    },
    ["body"],
  ),
);
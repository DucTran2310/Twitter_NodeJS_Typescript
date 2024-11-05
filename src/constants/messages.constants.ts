import { TweetAudienceEnum, TweetTypeEnum } from '~/constants/enums'
import { enumValuesToArray } from '~/utils/enumsToArray'

export const USER_MESSAGE = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  USER_ACCOUNT_IS_DEACTIVATED:
    'Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với quản trị viên để biết thêm thông tin',
  USER_FOUND: 'Lấy thông tin người dùng thành công',
  USER_ALREADY_FOLLOWED: 'Người dùng đã được theo dõi trước đó',
  OBJECT_ID_INVALID: 'ID người dùng không hợp lệ',

  //accessToken
  ACCESS_TOKEN_IS_REQUIRED: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống access token)',
  ACCESS_TOKEN_INVALID: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi access token)',

  // refreshToken
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token thành công',
  REFRESH_TOKEN_INVALID:
    'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi refresh_token), hãy kiểm tra xem bạn đã sử dụng đúng token hay token đã hết hạn hay chưa hay chưa',
  REFRESH_TOKEN_IS_REQUIRED: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống refresh token)',
  REFRESH_TOKEN_EXPIRED: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi refresh token hết hạn)',
  REFRESH_TOKEN_INVALID_ERROR: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi refresh token không đúng định dạng)',

  //userName
  USERNAME_VALIDATION_ERROR:
    'Username cần có độ dài từ 4 tới 15 kí tự và chỉ được có chữ, số, dấu gạch dưới. Và không được chỉ có mỗi số',
  USERNAME_ALREADY_EXISTS: 'Username đã có người sử dụng, vui lòng sử dụng một cái khác',

  //email
  EMAIL_VERIFY_TOKEN_INVALID:
    'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi email verify token), hãy kiểm tra xem bạn đã sử dụng đúng token hoặc token đã hết hạn hay chưa',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống email verify token)',
  EMAIL_VERIFY_TOKEN_IS_NOT_EXIST: 'Có lỗi xảy ra, vui lòng thử lại sau! (email verify token không tồn tại trong DB)',
  GOOGLE_ACCOUNT_NOT_VERIFIED: 'Tài khoản Google của bạn chưa được xác  thực, vui lòng xác thực trước khi tiếp tục',
  FORGOT_PASSWORD_TOKEN_INVALID:
    'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi sai forgot password token), hãy kiểm tra xem bạn đã sử dụng đúng token hoặc token đã hết hạn hay chưa',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống forgot password token)',
  EMAIL_VERIFY_TOKEN_IS_VERIFIED: 'Email đã được xác minh trước đó',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'E-mail hoặc mật khẩu không chính xác',
  NAME_IS_REQUIRED: 'Không được để trống tên người dùng',
  NAME_LENGTH_IS_INVALID: 'Tên người dùng phải có độ dài từ 1 đến 100 ký tự',
  EMAIL_IS_REQUIRED: 'Không được để trống địa chỉ e-mail',
  EMAIL_IS_INVALID: 'Địa chỉ e-mail không hợp lệ',
  EMAIL_ALREADY_EXISTS: 'Địa chỉ e-mail đã tồn tại, vui lòng sử dụng một e-mail khác',
  EMAIL_DOES_NOT_EXIST: 'Địa chỉ e-mail không tồn tại, vui lòng kiểm tra lại',

  //password
  PASSWORD_IS_REQUIRED: 'Không được để trống mật khẩu',
  PASSWORD_LENGTH_INVALID: 'Mật khẩu phải có độ dài từ 6 đến 50 ký tự',
  PASSWORD_MUST_BE_STRONG:
    'Mật khẩu cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt',
  NEW_PASSWORD_NOT_SAME_OLD_PASSWORD: 'Mật khẩu mới không được giống mật khẩu cũ',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Thay đổi mật khẩu thành công!',
  OLD_PASSWORD_IS_MISMATCHED: 'Mật khẩu cũ không đúng, vui lòng nhập lại',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Không được để trống mật khẩu xác thực',
  CONFIRM_PASSWORD_LENGTH_INVALID: 'Mật khẩu xác thực phải có độ dài từ 6 đến 50 ký tự',
  CONFIRM_PASSWORD_INVALID: 'Mật khẩu xác thực không khớp',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Mật khẩu xác thực cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt',

  BIO_MUST_BE_STRING: 'Bio phải là chuỗi và có độ dài tối đa 200 ký tự',
  LOCATION_MUST_BE_STRING: 'Địa chỉ phải là chuỗi và có độ dài tối đa 200 ký tự',
  WEBSITE_MUST_BE_STRING: 'Địa chỉ website phải là chuỗi và có độ dài tối đa 200 ký tự',
  USERNAME_MUST_BE_STRING: 'Tên người dùng phải là chuỗi và có độ dài tối đa 50 ký tự',
  IMAGE_MUST_BE_STRING: 'Độ dài tối đa 400 ký tự',

  SEND_EMAIL_FORGOT_PASSWORD_SUCCESS: 'Đã gửi e-mail xác thực mật khẩu, vui lòng kiểm tra email để tiếp tục',
  USER_NOT_VERIFY: 'Bạn chưa xác thực e-mail, vui lòng xác thực e-mail',

  //message success
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  VERIFY_EMAIL_SUCCESS: 'Xác thực email thành công',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Xác minh mã thông báo quên mật khẩu thành công'
} as const

export const FOLLOW_MESSAGE = {
  NEED_TO_FOLLOW_FIRST: 'Bạn cần theo dõi người dùng hiện tại nếu muốn hủy theo dõi họ',
  FOLLOW_SUCCESSFULLY: 'Theo dõi người dùng thành công',
  UNFOLLOW_SUCCESSFULLY: 'Bỏ theo dõi người dùng thành công'
} as const

export const MEDIA_MESSAGE = {
  UPLOAD_IMAGE_SUCCESSFULLY: 'Upload ảnh thành công',
  UPLOAD_VIDEO_SUCCESSFULLY: 'Upload video thành công'
} as const

export const TWEET_MESSAGE = {
  TWEET_NOT_FOUND: 'Không tìm thấy tweet',
  GET_TWEET_SUCCESSFULLY: 'Lấy tweet thành công',
  TWEET_SUCCESSFULLY: 'Tạo tweet thành công',
  DELETE_TWEET_SUCCESSFULLY: 'Xóa tweet thành công',
  TWEET_TYPE_INVALID: `Đối tượng xem tweet phải là một trong các giá trị sau: ${enumValuesToArray(TweetTypeEnum).join(
    ', '
  )}`,
  TWEET_AUDIENCE_INVALID: `Kiểu tweet phải là một trong các giá trị sau: ${enumValuesToArray(TweetAudienceEnum).join(
    ', '
  )}`,
  PARENT_ID_MUST_BE_NULL: 'Khi tạo tweet thì parent_id phải là null',
  PARENT_ID_IS_REQUIRED: 'Khi retweet, quotetweet và comment thì parent_id là bắt buộc',
  PARENT_ID_CAN_NOT_BE_INVALID: 'Khi retweet, quotetweet và comment thì parent_id phải hợp lệ',
  CONTENT_IS_REQUIRED: 'Nội dung tweet không được để trống',
  CONTENT_MUST_BE_EMPTY: 'Khi retweet thì nội dung tweet phải để trống',
  HASHTAGS_MUST_BE_STRINGS: 'Hashtags phải là một mảng chứa các chuỗi',
  MENTIONS_MUST_BE_STRINGS: 'Mentions phải là một mảng chứa các user_id',
  MEDIAS_MUST_BE_OBJECTS: 'Medias phải là một mảng chứa các medias object có dạng {url: string, type: string}'
} as const

export const BOOKMARK_MESSAGE = {
  BOOKMARK_SUCCESSFULLY: 'Lưu tweet thành công',
  UNBOOKMARK_SUCCESSFULLY: 'Bỏ lưu tweet thành công'
} as const

export const MESSAGE_NOT_DEFINED = {
  JWT_SECRET_ACCESS_TOKEN_NOT_DEFINED: 'JWT_SECRET_ACCESS_TOKEN is not defined',
  JWT_SECRET_REFRESH_TOKEN_NOT_DEFINED: 'JWT_SECRET_REFRESH_TOKEN is not defined',
  JWT_SECRET_EMAIL_VERIFY_TOKEN_NOT_DEFINED: 'JWT_SECRET_EMAIL_VERIFY_TOKEN is not defined',
  JWT_SECRET_FORGOT_PASSWORD_TOKEN_NOT_DEFINED: 'JWT_SECRET_FORGOT_PASSWORD_TOKEN is not defined'
} as const

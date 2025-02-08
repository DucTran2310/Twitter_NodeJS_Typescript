import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { HttpStatusCode } from "~/constants/httpStatusCode.enum"
import { TWEET_MESSAGE } from "~/constants/messages.constants"
import { TTweetReqBody } from "~/models/requests/Tweet.requests"
import { TokenPayload } from "~/models/requests/User.request"
import tweetsServices from "~/services/tweets.services"

export const createTweetController = async (req: Request<ParamsDictionary, any, TTweetReqBody>, res: Response) => {
  const tweetRequestBody = req.body
  // const decoded_access_token = req.decoded_access_token
  // const { user_id } = decoded_access_token as TokenPayload
  // const result = await tweetsServices.createTweets(tweetRequestBody, user_id)
  // res.status(HttpStatusCode.OK).json({
  //   message: TWEET_MESSAGE.TWEET_SUCCESSFULLY,
  //   result
  // })
  res.status(HttpStatusCode.OK).json({
    message: TWEET_MESSAGE.TWEET_SUCCESSFULLY,
    result: 'abc'
  })
}

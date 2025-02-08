import { Router } from "express";
import { createTweetController } from "~/controllers/tweets.controllers";
import { createTweetValidator } from "~/middlewares/tweets.middlewares";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const tweetsRouter = Router();

/**
 * Description. Create Twweet
 * Path: /
 * Method: POST
 * Body: TweetRequestBody
 */

tweetsRouter.post('/', createTweetValidator, wrapRequestHandler(createTweetController))

export default tweetsRouter;


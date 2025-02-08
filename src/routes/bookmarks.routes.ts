import { Router } from "express";
import { createBookmarkController } from "~/controllers/bookmarks.controllers";
import { createBookmarkValidator } from "~/middlewares/bookmarks.middlewares";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const bookmarkRouter = Router();

/**
 * Description. Create Bookmark
 * Path: /
 * Method: POST
 * Body: { tweetId: string }
 * Headers: Authorization Bearer <access_token>
 */
bookmarkRouter.post("/", accessTokenValidator, verifiedUserValidator, createBookmarkValidator, wrapRequestHandler(createBookmarkController));

export default bookmarkRouter;
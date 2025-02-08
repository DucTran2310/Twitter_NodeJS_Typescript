import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BOOKMARK_MESSAGE } from "~/constants/messages.constants";
import { TBookmarkReqBody } from "~/models/requests/Bookmark.requests";
import { TokenPayload } from "~/models/requests/User.request";
import bookmarkServices from "~/services/bookmarks.services";

export const createBookmarkController = async (
  req: Request<ParamsDictionary, any, TBookmarkReqBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { tweet_id } = req.body;
  const result = await bookmarkServices.createBookmark(tweet_id, user_id);
  res.status(200).send({
    result,
    message: BOOKMARK_MESSAGE.BOOKMARK_SUCCESSFULLY,
  });
};
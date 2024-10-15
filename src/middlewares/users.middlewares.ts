import { Request, Response, NextFunction } from "express";

export const loginValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password',
    });
  } else {
    next(); // Gọi `next` khi hợp lệ và không trả về giá trị gì
  }
};
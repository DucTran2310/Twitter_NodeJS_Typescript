import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { SignUpReqBodyType } from "~/models/requests/User.request";
import usersService from "~/services/users.services";

export const loginController = (req: Request, res: Response) => {
  const {email, password} = req.body

  if(email === 'trananhduc23102000@gmail.com' && password === '123456') {
    res.status(200).json({
      message: 'Login successful'
    })
  }

  res.status(400).json({
    message: 'Error login'
  })
}


export const registerController = async (req: Request<ParamsDictionary, any, SignUpReqBodyType>, res: Response) => {
  const result = await usersService.register(req.body);
  res.status(HttpStatusCode.CREATED).json({
    message: "Đăng ký thành công",
    result,
  });
};
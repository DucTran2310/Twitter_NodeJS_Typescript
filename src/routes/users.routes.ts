import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/requestHandlers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter

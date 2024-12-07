import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import dotenv, { config } from 'dotenv'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/files.utils'
import { IMAGE_UPLOAD_DIR, VIDEO_UPLOAD_DIR } from '~/constants/constants'
import staticRouter from '~/routes/static.routes'
config()

initFolder()

const app = express()
const port = process.env.PORT || 8888

// Load environment variables from the correct .env file
const envFile =
  process.env.NODE_ENV === 'development'
    ? '.env.development'
    : process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.example'

dotenv.config({ path: envFile })

app.use(express.json())

// Route
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
// app.use('/static', staticRouter)

// use static with express
app.use('/static', express.static(IMAGE_UPLOAD_DIR))
// app.use('/static', express.static(VIDEO_UPLOAD_DIR))
app.use('/static/video', express.static(VIDEO_UPLOAD_DIR))

app.use(defaultErrorHandler)

databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

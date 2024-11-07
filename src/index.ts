import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import dotenv from 'dotenv'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import { pick } from 'lodash'
import mediasRouter from '~/routes/medias.routes'

const app = express()
const port = 8080

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

app.use(defaultErrorHandler)

databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

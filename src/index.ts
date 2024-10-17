import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import dotenv from 'dotenv'

const app = express()
const port = 8080

// Load environment variables from the correct .env file
const envFile =
  process.env.NODE_ENV === 'development'
    ? '.env.development'
    : process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.example';

dotenv.config({ path: envFile });

app.use(express.json())

app.use('/users', usersRouter)

databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
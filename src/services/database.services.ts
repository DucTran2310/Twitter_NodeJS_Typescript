import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

// Load environment variables from the correct .env file
const envFile =
  process.env.NODE_ENV === 'development'
    ? '.env.development'
    : process.env.NODE_ENV === 'production'
      ? 'production'
      : '.env.example'
dotenv.config({ path: envFile })

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.z9tcw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log(':::Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }
}

const databaseService = new DatabaseService()
export default databaseService

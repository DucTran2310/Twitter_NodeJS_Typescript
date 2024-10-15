import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from the correct .env file
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : process.env.NODE_ENV === 'production' ? 'production' : '.env.example';
dotenv.config({ path: envFile });

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.z9tcw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(uri)
  }

  async connect() {
    try {
      await this.client.db("admin").command({ ping: 1 });
      console.log(":::Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      await this.client.close();
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService

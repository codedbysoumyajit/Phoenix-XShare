import { MongoClient } from 'mongodb';
import log from './console.js';
import config from './../../config/config.js';

let mongoDB;

async function getDB() {
  if (!mongoDB) {
      try {
const client = new MongoClient(config.settings.mongoURI);
        await client.connect();
        log(`Connected to MongoDB server`)
    mongoDB = client.db('phoenix-xshare');
      } catch (error) {
        log(error);
        throw error;
      }
  }
  return mongoDB;
}

export default getDB;
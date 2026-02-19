import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri(), { dbName: 'homebudgetingdb' })
})

afterEach(async () => {
  // clear DB between tests
  const collections = await mongoose.connection.db.collections()
  for (const c of collections) await c.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
})

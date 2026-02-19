import mongoose from 'mongoose'
import { execSync } from 'child_process'

let containerId

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

  // Start MongoDB Docker container with replica set
  try {
    // Generate unique container name
    const containerName = `mongodb-test-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    // Check if any mongodb-test containers exist and remove them
    try {
      const existingContainers = execSync(
        'docker ps -aq --filter name=mongodb-test',
        { encoding: 'utf-8' },
      ).trim()
      if (existingContainers) {
        execSync(`docker rm -f ${existingContainers}`, { stdio: 'pipe' })
      }
    } catch (e) {
      // Ignore errors
    }

    // Start new container with replica set
    containerId = execSync(
      `docker run -d --name ${containerName} -p 27018:27017 mongo:7.0 --replSet rs0`,
      { encoding: 'utf-8' },
    ).trim()

    // Store container name for cleanup
    process.env.MONGO_CONTAINER_NAME = containerName

    // Wait for MongoDB to start (configurable via env or default 5 seconds)
    const mongoStartupDelay = parseInt(
      process.env.MONGO_STARTUP_DELAY || '5000',
      10,
    )
    await new Promise((resolve) => setTimeout(resolve, mongoStartupDelay))

    // Initialize replica set
    try {
      execSync(`docker exec ${containerName} mongosh --eval "rs.initiate()"`, {
        stdio: 'pipe',
        timeout: 10000,
      })
    } catch (e) {
      console.warn(
        'Failed to initialize MongoDB replica set.',
        'Tests requiring transactions (daily expense updates/deletes, toggle-selectable) will fail.',
        'To resolve: Ensure Docker is running and has sufficient resources.',
        'Error:',
        e.message,
      )
    }

    // Wait for replica set to be ready with exponential backoff
    let retries = 30
    let delay = 500 // Start with 500ms
    while (retries > 0) {
      try {
        if (retries % 5 === 0) {
          console.log(
            `Attempting to connect to MongoDB... (${retries} retries remaining)`,
          )
        }
        await mongoose.connect(
          'mongodb://localhost:27018/homebudgetingdb?replicaSet=rs0&directConnection=true',
          {
            serverSelectionTimeoutMS: 1000,
          },
        )
        console.log('Successfully connected to MongoDB')
        break
      } catch (e) {
        retries--
        if (retries === 0) {
          console.error('Failed to connect to MongoDB after all retries')
          throw e
        }
        await new Promise((resolve) => setTimeout(resolve, delay))
        // Exponential backoff, max 3 seconds
        delay = Math.min(delay * 1.5, 3000)
      }
    }
  } catch (error) {
    console.error('Failed to start MongoDB container:', error)
    throw error
  }
}, 90000) // 90 second timeout for setup

afterEach(async () => {
  // Clear DB between tests
  try {
    const collections = await mongoose.connection.db.collections()
    for (const c of collections) await c.deleteMany({})
  } catch (e) {
    // Ignore errors during cleanup
  }
})

afterAll(async () => {
  try {
    await mongoose.disconnect()
  } catch (e) {
    // Ignore disconnect errors
  }

  // Stop and remove container
  if (containerId) {
    const containerName = process.env.MONGO_CONTAINER_NAME || 'mongodb-test'
    try {
      execSync(`docker stop ${containerName}`, { stdio: 'ignore' })
      execSync(`docker rm ${containerName}`, { stdio: 'ignore' })
    } catch (e) {
      // Ignore cleanup errors
    }
  }
})

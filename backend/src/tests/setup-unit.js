// Unit test setup - no database required
// This file is for pure unit tests that don't need MongoDB

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
})

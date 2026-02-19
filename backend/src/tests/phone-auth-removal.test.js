import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { User } from '../models/user.model.js'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'

describe('Phone Authentication Removal Tests', () => {
  describe('User Model - Firebase Only', () => {
    it('should create user with firebaseUid and email', async () => {
      const user = await User.create({
        firebaseUid: 'test-firebase-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })

      expect(user.firebaseUid).toBe('test-firebase-uid-123')
      expect(user.email).toBe('test@example.com')
      expect(user.displayName).toBe('Test User')
      expect(user.isActive).toBe(true)
      expect(user.phoneNumber).toBeUndefined()
      expect(user.phoneVerified).toBeUndefined()
    })

    it('should fail to create user without firebaseUid', async () => {
      try {
        await User.create({
          email: 'test@example.com',
          displayName: 'Test User',
        })
        expect.fail('Should have thrown validation error')
      } catch (error) {
        expect(error.message).toContain('Firebase UID is required')
      }
    })

    it('should fail to create user without email', async () => {
      try {
        await User.create({
          firebaseUid: 'test-firebase-uid-456',
          displayName: 'Test User',
        })
        expect.fail('Should have thrown validation error')
      } catch (error) {
        expect(error.message).toContain('Email is required')
      }
    })

    it('should fail to create user without displayName', async () => {
      try {
        await User.create({
          firebaseUid: 'test-firebase-uid-789',
          email: 'test@example.com',
        })
        expect.fail('Should have thrown validation error')
      } catch (error) {
        expect(error.message).toContain('Name is required')
      }
    })

    it('should enforce unique firebaseUid', async () => {
      await User.create({
        firebaseUid: 'duplicate-uid',
        email: 'user1@example.com',
        displayName: 'User One',
      })

      try {
        await User.create({
          firebaseUid: 'duplicate-uid',
          email: 'user2@example.com',
          displayName: 'User Two',
        })
        expect.fail('Should have thrown duplicate key error')
      } catch (error) {
        expect(error.code).toBe(11000) // MongoDB duplicate key error
      }
    })

    it('should enforce unique email', async () => {
      await User.create({
        firebaseUid: 'uid-1',
        email: 'duplicate@example.com',
        displayName: 'User One',
      })

      try {
        await User.create({
          firebaseUid: 'uid-2',
          email: 'duplicate@example.com',
          displayName: 'User Two',
        })
        expect.fail('Should have thrown duplicate key error')
      } catch (error) {
        expect(error.code).toBe(11000) // MongoDB duplicate key error
      }
    })

    it('should normalize email to lowercase', async () => {
      const user = await User.create({
        firebaseUid: 'test-uid-lowercase',
        email: 'TEST@EXAMPLE.COM',
        displayName: 'Test User',
      })

      expect(user.email).toBe('test@example.com')
    })

    it('should trim email whitespace', async () => {
      const user = await User.create({
        firebaseUid: 'test-uid-trim',
        email: '  test@example.com  ',
        displayName: 'Test User',
      })

      expect(user.email).toBe('test@example.com')
    })

    it('should trim displayName whitespace', async () => {
      const user = await User.create({
        firebaseUid: 'test-uid-name-trim',
        email: 'test@example.com',
        displayName: '  Test User  ',
      })

      expect(user.displayName).toBe('Test User')
    })

    it('should enforce displayName length constraints', async () => {
      // Too short
      try {
        await User.create({
          firebaseUid: 'uid-short-name',
          email: 'short@example.com',
          displayName: 'AB',
        })
        expect.fail('Should have thrown validation error for short name')
      } catch (error) {
        expect(error.message).toContain('at least 3 characters')
      }

      // Too long
      try {
        await User.create({
          firebaseUid: 'uid-long-name',
          email: 'long@example.com',
          displayName: 'A'.repeat(31),
        })
        expect.fail('Should have thrown validation error for long name')
      } catch (error) {
        expect(error.message).toContain('cannot exceed 30 characters')
      }
    })
  })

  describe('Phone Authentication Routes - Removed', () => {
    it('should return 404 for POST /api/v1/users/register', async () => {
      const res = await request(app).post('/api/v1/users/register').send({
        phoneNumber: '03001234567',
        displayName: 'Test User',
      })

      expect(res.status).toBe(404)
    })

    it('should return 404 for POST /api/v1/users/login', async () => {
      const res = await request(app).post('/api/v1/users/login').send({
        phoneNumber: '03001234567',
      })

      expect(res.status).toBe(404)
    })
  })

  describe('Test Helper - createTestUserWithToken', () => {
    it('should create a user with JWT token', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Helper Test User',
      })

      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.userId).toBeDefined()
      expect(result.user.firebaseUid).toBeDefined()
      expect(result.user.email).toBeDefined()
      expect(result.user.displayName).toBe('Helper Test User')
      expect(typeof result.token).toBe('string')
      expect(typeof result.userId).toBe('string')
    })

    it('should create unique users on multiple calls', async () => {
      const user1 = await createTestUserWithToken({
        displayName: 'User One',
      })
      const user2 = await createTestUserWithToken({
        displayName: 'User Two',
      })

      expect(user1.user.firebaseUid).not.toBe(user2.user.firebaseUid)
      expect(user1.user.email).not.toBe(user2.user.email)
      expect(user1.userId).not.toBe(user2.userId)
      expect(user1.token).not.toBe(user2.token)
    })

    it('should allow custom user data', async () => {
      const customFirebaseUid = 'custom-firebase-uid-123'
      const customEmail = 'custom@example.com'

      const result = await createTestUserWithToken({
        firebaseUid: customFirebaseUid,
        email: customEmail,
        displayName: 'Custom User',
      })

      expect(result.user.firebaseUid).toBe(customFirebaseUid)
      expect(result.user.email).toBe(customEmail)
      expect(result.user.displayName).toBe('Custom User')
    })

    it('should generate valid JWT tokens', async () => {
      const result = await createTestUserWithToken({
        displayName: 'JWT Test User',
      })

      // Token should be in format: header.payload.signature
      const tokenParts = result.token.split('.')
      expect(tokenParts).toHaveLength(3)

      // Token should work with API endpoints
      const res = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${result.token}`)

      expect(res.status).toBe(200)
    })
  })

  describe('User Schema - No Phone Fields', () => {
    it('should not have phoneNumber field in schema', () => {
      const schemaFields = Object.keys(User.schema.paths)
      expect(schemaFields).not.toContain('phoneNumber')
    })

    it('should not have phoneVerified field in schema', () => {
      const schemaFields = Object.keys(User.schema.paths)
      expect(schemaFields).not.toContain('phoneVerified')
    })

    it('should have required Firebase fields in schema', () => {
      const schemaFields = Object.keys(User.schema.paths)
      expect(schemaFields).toContain('firebaseUid')
      expect(schemaFields).toContain('email')
      expect(schemaFields).toContain('displayName')
      expect(schemaFields).toContain('isActive')
    })

    it('should have correct field requirements', () => {
      const schema = User.schema.paths

      expect(schema.firebaseUid.isRequired).toBe(true)
      expect(schema.firebaseUid.options.unique).toBe(true)
      expect(schema.firebaseUid.options.index).toBe(true)

      expect(schema.email.isRequired).toBe(true)
      expect(schema.email.options.unique).toBe(true)
      expect(schema.email.options.lowercase).toBe(true)

      expect(schema.displayName.isRequired).toBe(true)
      expect(schema.isActive.options.default).toBe(true)
    })
  })

  describe('Firebase Authentication Flow', () => {
    it('should have /api/v1/auth/bootstrap endpoint available', async () => {
      // This should fail with 401 (no token), not 404 (not found)
      const res = await request(app).post('/api/v1/auth/bootstrap').send()

      expect(res.status).toBe(401)
      expect(res.body.message).toContain('Unauthorized')
    })
  })

  describe('Existing API Endpoints with JWT Auth', () => {
    it('should still authenticate with JWT tokens for API access', async () => {
      const testUser = await createTestUserWithToken({
        displayName: 'API Test User',
      })

      // Test that JWT auth still works for protected endpoints
      const res = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          description: 'Test Income',
          projectedAmount: 1000,
          actualAmount: 1000,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('should reject requests without JWT token', async () => {
      const res = await request(app).post('/api/v1/incomes/').send({
        description: 'Test Income',
        projectedAmount: 1000,
        month: '2026-01-01T00:00:00.000Z',
      })

      expect(res.status).toBe(401)
    })
  })
})

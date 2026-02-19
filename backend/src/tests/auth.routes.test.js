import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { User } from '../models/user.model.js'
import * as firebaseConfig from '../config/firebase.js'

// Mock Firebase Admin SDK
vi.mock('../config/firebase.js', async () => {
  const actual = await vi.importActual('../config/firebase.js')
  return {
    ...actual,
    getAuth: vi.fn(() => ({
      verifyIdToken: vi.fn(),
    })),
  }
})

describe('Firebase Auth Routes - /api/v1/auth', () => {
  let mockVerifyIdToken

  beforeEach(() => {
    mockVerifyIdToken = vi.fn()
    vi.mocked(firebaseConfig.getAuth).mockReturnValue({
      verifyIdToken: mockVerifyIdToken,
    })
  })

  describe('POST /api/v1/auth/bootstrap', () => {
    it('should return 401 when missing Authorization header', async () => {
      const res = await request(app).post('/api/v1/auth/bootstrap').send()

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Unauthorized')
    })

    it('should return 401 when Authorization header is malformed', async () => {
      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('Authorization', 'InvalidFormat token123')
        .send()

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should return 403 when token is valid but email_verified is false', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        email_verified: false,
        name: 'Test User',
      })

      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('Authorization', 'Bearer valid-token')
        .send()

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Email not verified')
    })

    it('should return 401 when token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('Authorization', 'Bearer invalid-token')
        .send()

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Invalid token')
    })

    it('should create a new user when token is valid and email is verified', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-456',
        email: 'newuser@example.com',
        email_verified: true,
        name: 'New User',
      })

      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('Authorization', 'Bearer valid-token')
        .send()

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toContain('bootstrapped successfully')
      expect(res.body.data.user).toBeDefined()
      expect(res.body.data.user.firebaseUid).toBe('firebase-uid-456')
      expect(res.body.data.user.email).toBe('newuser@example.com')
      expect(res.body.data.user.displayName).toBe('New User')

      // Verify user was created in database
      const user = await User.findOne({ firebaseUid: 'firebase-uid-456' })
      expect(user).toBeTruthy()
      expect(user.email).toBe('newuser@example.com')
    })

    it('should upsert existing user when firebaseUid already exists', async () => {
      // Create initial user
      await User.create({
        firebaseUid: 'firebase-uid-789',
        email: 'original@example.com',
        displayName: 'Original Name',
      })

      mockVerifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-789',
        email: 'updated@example.com',
        email_verified: true,
        name: 'Updated Name',
      })

      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('Authorization', 'Bearer valid-token')
        .send()

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.firebaseUid).toBe('firebase-uid-789')
      expect(res.body.data.user.email).toBe('updated@example.com')

      // Verify only one user exists
      const users = await User.find({ firebaseUid: 'firebase-uid-789' })
      expect(users).toHaveLength(1)
      expect(users[0].email).toBe('updated@example.com')
    })

    it('should use email prefix as displayName when name is not provided', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-noname',
        email: 'testuser@example.com',
        email_verified: true,
      })

      const res = await request(app)
        .post('/api/v1/auth/bootstrap')
        .set('Authorization', 'Bearer valid-token')
        .send()

      expect(res.status).toBe(200)
      expect(res.body.data.user.displayName).toBe('testuser')
    })
  })
})

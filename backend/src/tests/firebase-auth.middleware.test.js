import { describe, expect, it, vi, beforeEach } from 'vitest'
import { verifyFirebaseToken } from '../middlewares/firebase-auth.middleware.js'
import { ApiError } from '../utils/ApiError.js'

// Mock firebase config
vi.mock('../config/firebase.js', () => ({
  getAuth: vi.fn(),
}))

import { getAuth } from '../config/firebase.js'

describe('verifyFirebaseToken middleware', () => {
  let req, res, next, mockAuth

  beforeEach(() => {
    req = {
      header: vi.fn(),
    }
    res = {}
    next = vi.fn()
    
    mockAuth = {
      verifyIdToken: vi.fn(),
    }
    
    getAuth.mockReturnValue(mockAuth)
    vi.clearAllMocks()
  })

  describe('Token extraction', () => {
    it('passes ApiError to next() when Authorization header is missing', async () => {
      req.header.mockReturnValue(undefined)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Unauthorized: Missing or invalid token')
    })

    it('passes ApiError to next() when Authorization header does not start with Bearer', async () => {
      req.header.mockReturnValue('InvalidFormat token123')
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Unauthorized: Missing or invalid token')
    })

    it('extracts token from Authorization header correctly', async () => {
      req.header.mockReturnValue('Bearer valid-firebase-token')
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid',
        email: 'test@example.com',
        email_verified: true,
      })
      
      await verifyFirebaseToken(req, res, next)
      
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-firebase-token')
    })
  })

  describe('Token verification', () => {
    it('verifies token and attaches decoded user to request', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        email_verified: true,
        name: 'Test User',
      }
      
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(req.firebaseUser).toEqual(mockDecodedToken)
      expect(next).toHaveBeenCalledWith()
    })

    it('passes ApiError to next() when token verification fails', async () => {
      req.header.mockReturnValue('Bearer invalid-token')
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Unauthorized: Invalid token')
    })

    it('passes ApiError to next() when email is not verified', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        email_verified: false,
      }
      
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(403)
      expect(error.message).toBe('Forbidden: Email not verified')
    })
  })

  describe('Email verification check', () => {
    it('allows access when email is verified', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'verified@example.com',
        email_verified: true,
      }
      
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalledWith()
      expect(req.firebaseUser.email_verified).toBe(true)
    })

    it('blocks access when email is not verified', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'unverified@example.com',
        email_verified: false,
      }
      
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(403)
      expect(error.message).toContain('Email not verified')
    })
  })

  describe('Error handling', () => {
    it('preserves ApiError thrown during email verification check', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        email_verified: false,
      }
      
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(403)
    })

    it('converts non-ApiError to ApiError during token verification', async () => {
      req.header.mockReturnValue('Bearer invalid-token')
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Firebase error'))
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Unauthorized: Invalid token')
    })
  })

  describe('Middleware flow', () => {
    it('calls next() after successful verification', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        email_verified: true,
      }
      
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('calls next(error) when verification fails', async () => {
      req.header.mockReturnValue('Bearer invalid-token')
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid'))
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
    })

    it('calls next(error) when email is not verified', async () => {
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: 'uid',
        email: 'test@example.com',
        email_verified: false,
      })
      
      await verifyFirebaseToken(req, res, next)
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
    })
  })

  describe('Firebase auth integration', () => {
    it('calls getAuth to retrieve Firebase auth instance', async () => {
      req.header.mockReturnValue('Bearer valid-token')
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: 'uid',
        email: 'test@example.com',
        email_verified: true,
      })
      
      await verifyFirebaseToken(req, res, next)
      
      expect(getAuth).toHaveBeenCalled()
    })

    it('uses Firebase auth to verify token', async () => {
      const token = 'firebase-id-token'
      req.header.mockReturnValue(`Bearer ${token}`)
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: 'uid',
        email: 'test@example.com',
        email_verified: true,
      })
      
      await verifyFirebaseToken(req, res, next)
      
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token)
    })
  })
})

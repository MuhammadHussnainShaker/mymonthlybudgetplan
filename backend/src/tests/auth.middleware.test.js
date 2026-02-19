import { describe, expect, it, vi, beforeEach } from 'vitest'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'

vi.mock('jsonwebtoken')
vi.mock('../models/user.model.js')

describe('verifyJWT middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      cookies: {},
      header: vi.fn(),
    }
    res = {}
    next = vi.fn()
    
    vi.clearAllMocks()
  })

  describe('Token extraction', () => {
    it('extracts token from cookies.token', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.cookies.token = 'valid-token'
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      })
      
      await verifyJWT(req, res, next)
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalledWith()
    })

    it('extracts token from cookies.accessToken', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.cookies.accessToken = 'valid-token'
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      })
      
      await verifyJWT(req, res, next)
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalledWith()
    })

    it('extracts token from Authorization header', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.header.mockReturnValue('Bearer valid-token')
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      })
      
      await verifyJWT(req, res, next)
      
      expect(req.header).toHaveBeenCalledWith('Authorization')
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalledWith()
    })

    it('prioritizes cookies.token over Authorization header', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.cookies.token = 'cookie-token'
      req.header.mockReturnValue('Bearer header-token')
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      })
      
      await verifyJWT(req, res, next)
      
      expect(jwt.verify).toHaveBeenCalledWith('cookie-token', process.env.JWT_SECRET)
    })
  })

  describe('Token validation', () => {
    it('passes ApiError to next() when no token is provided', async () => {
      await verifyJWT(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Unauthorized request')
    })

    it('passes ApiError to next() when token verification fails', async () => {
      req.cookies.token = 'invalid-token'
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })
      
      await verifyJWT(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Invalid access token')
    })

    it('passes ApiError to next() when user is not found', async () => {
      req.cookies.token = 'valid-token'
      jwt.verify.mockReturnValue({ userId: 'nonexistent' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      })
      
      await verifyJWT(req, res, next)
      
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Invalid access token')
    })
  })

  describe('User retrieval', () => {
    it('retrieves user using userId from token', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.cookies.token = 'valid-token'
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      const selectMock = vi.fn().mockResolvedValue(mockUser)
      User.findById.mockReturnValue({ select: selectMock })
      
      await verifyJWT(req, res, next)
      
      expect(User.findById).toHaveBeenCalledWith('user123')
      expect(selectMock).toHaveBeenCalledWith('-__v')
      expect(req.user).toEqual(mockUser)
    })

    it('retrieves user using _id from token (fallback)', async () => {
      const mockUser = { _id: 'user456', displayName: 'Test User 2' }
      req.cookies.token = 'valid-token'
      
      jwt.verify.mockReturnValue({ _id: 'user456' })
      const selectMock = vi.fn().mockResolvedValue(mockUser)
      User.findById.mockReturnValue({ select: selectMock })
      
      await verifyJWT(req, res, next)
      
      expect(User.findById).toHaveBeenCalledWith('user456')
      expect(req.user).toEqual(mockUser)
    })

    it('excludes __v field from user object', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.cookies.token = 'valid-token'
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      const selectMock = vi.fn().mockResolvedValue(mockUser)
      User.findById.mockReturnValue({ select: selectMock })
      
      await verifyJWT(req, res, next)
      
      expect(selectMock).toHaveBeenCalledWith('-__v')
    })

    it('attaches user to request object', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User', email: 'test@example.com' }
      req.cookies.token = 'valid-token'
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      })
      
      await verifyJWT(req, res, next)
      
      expect(req.user).toBeDefined()
      expect(req.user._id).toBe('user123')
      expect(req.user.displayName).toBe('Test User')
      expect(req.user.email).toBe('test@example.com')
    })
  })

  describe('Middleware flow', () => {
    it('calls next() after successful authentication', async () => {
      const mockUser = { _id: 'user123', displayName: 'Test User' }
      req.cookies.token = 'valid-token'
      
      jwt.verify.mockReturnValue({ userId: 'user123' })
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      })
      
      await verifyJWT(req, res, next)
      
      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('calls next(error) when authentication fails', async () => {
      req.cookies.token = 'invalid-token'
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })
      
      await verifyJWT(req, res, next)
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiError))
    })
  })
})

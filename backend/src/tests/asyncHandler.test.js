import { describe, expect, it, vi } from 'vitest'
import { asyncHandler } from '../utils/asyncHandler.js'

describe('asyncHandler', () => {
  it('wraps an async function and calls it', async () => {
    const mockFn = vi.fn(async (req, res) => {
      res.status(200).json({ message: 'success' })
    })
    const wrapped = asyncHandler(mockFn)
    
    const req = {}
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(mockFn).toHaveBeenCalledWith(req, res, next)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'success' })
    expect(next).not.toHaveBeenCalled()
  })

  it('catches errors and passes them to next()', async () => {
    const error = new Error('Test error')
    const mockFn = vi.fn(async () => {
      throw error
    })
    const wrapped = asyncHandler(mockFn)
    
    const req = {}
    const res = {}
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(mockFn).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(error)
  })

  it('handles synchronous errors in async function', async () => {
    const error = new Error('Sync error')
    const mockFn = vi.fn(async () => {
      throw error
    })
    const wrapped = asyncHandler(mockFn)
    
    const req = {}
    const res = {}
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(next).toHaveBeenCalledWith(error)
  })

  it('forwards req, res, and next to the wrapped function', async () => {
    const mockFn = vi.fn(async (req, res, next) => {
      expect(req.userId).toBe(123)
      expect(res.status).toBeDefined()
      expect(next).toBeInstanceOf(Function)
    })
    const wrapped = asyncHandler(mockFn)
    
    const req = { userId: 123 }
    const res = { status: vi.fn() }
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(mockFn).toHaveBeenCalledWith(req, res, next)
  })

  it('handles custom error objects', async () => {
    class CustomError extends Error {
      constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
      }
    }
    
    const error = new CustomError('Not found', 404)
    const mockFn = vi.fn(async () => {
      throw error
    })
    const wrapped = asyncHandler(mockFn)
    
    const req = {}
    const res = {}
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(next).toHaveBeenCalledWith(error)
    expect(next.mock.calls[0][0]).toBeInstanceOf(CustomError)
    expect(next.mock.calls[0][0].statusCode).toBe(404)
  })

  it('returns a function that returns a promise', () => {
    const mockFn = vi.fn(async () => {})
    const wrapped = asyncHandler(mockFn)
    
    expect(wrapped).toBeInstanceOf(Function)
    
    const req = {}
    const res = {}
    const next = vi.fn()
    const result = wrapped(req, res, next)
    
    expect(result).toBeInstanceOf(Promise)
  })

  it('does not call next() when function succeeds', async () => {
    const mockFn = vi.fn(async (req, res) => {
      res.send('success')
    })
    const wrapped = asyncHandler(mockFn)
    
    const req = {}
    const res = {
      send: vi.fn(),
    }
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(mockFn).toHaveBeenCalled()
    expect(res.send).toHaveBeenCalledWith('success')
    expect(next).not.toHaveBeenCalled()
  })

  it('handles promise rejections', async () => {
    const error = new Error('Promise rejected')
    const mockFn = vi.fn(() => Promise.reject(error))
    const wrapped = asyncHandler(mockFn)
    
    const req = {}
    const res = {}
    const next = vi.fn()
    
    await wrapped(req, res, next)
    
    expect(next).toHaveBeenCalledWith(error)
  })
})

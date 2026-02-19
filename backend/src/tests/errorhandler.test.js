import { describe, expect, it, vi, beforeEach } from 'vitest'
import errorHandler from '../middlewares/errorhandler.js'
import { ApiError } from '../utils/ApiError.js'

describe('errorHandler middleware', () => {
  let req, res, next, consoleErrorSpy

  beforeEach(() => {
    req = {}
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    }
    next = vi.fn()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('logs the error to console', () => {
    const error = new Error('Test error')
    
    errorHandler(error, req, res, next)
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(error)
  })

  it('returns early if headers are already sent', () => {
    const error = new Error('Test error')
    res.headersSent = true
    
    errorHandler(error, req, res, next)
    
    expect(next).toHaveBeenCalledWith(error)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('uses error statusCode if available', () => {
    const error = new ApiError(404, 'Not found')
    
    errorHandler(error, req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not found',
      errors: [],
    })
  })

  it('defaults to 500 status code when not specified', () => {
    const error = new Error('Generic error')
    
    errorHandler(error, req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('uses error message if available', () => {
    const error = new Error('Custom error message')
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error message',
      }),
    )
  })

  it('defaults to "Internal Server Error" message when not specified', () => {
    const error = new Error()
    error.message = ''
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal Server Error',
      }),
    )
  })

  it('includes errors array from ApiError', () => {
    const errors = [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password is required' },
    ]
    const error = new ApiError(400, 'Validation failed', errors)
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors,
      }),
    )
  })

  it('defaults to empty errors array when not specified', () => {
    const error = new Error('Test error')
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [],
      }),
    )
  })

  it('includes stack trace in development mode', () => {
    process.env.NODE_ENV = 'development'
    const error = new Error('Test error')
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      }),
    )
    
    delete process.env.NODE_ENV
  })

  it('excludes stack trace in production mode', () => {
    process.env.NODE_ENV = 'production'
    const error = new Error('Test error')
    
    errorHandler(error, req, res, next)
    
    const payload = res.json.mock.calls[0][0]
    expect(payload.stack).toBeUndefined()
    
    delete process.env.NODE_ENV
  })

  it('always sets success to false', () => {
    const error = new Error('Test error')
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    )
  })

  it('handles various HTTP error codes', () => {
    const error400 = new ApiError(400, 'Bad Request')
    const error401 = new ApiError(401, 'Unauthorized')
    const error403 = new ApiError(403, 'Forbidden')
    const error404 = new ApiError(404, 'Not Found')
    const error500 = new ApiError(500, 'Internal Server Error')
    
    errorHandler(error400, req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    
    res.status.mockClear()
    errorHandler(error401, req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    
    res.status.mockClear()
    errorHandler(error403, req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    
    res.status.mockClear()
    errorHandler(error404, req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
    
    res.status.mockClear()
    errorHandler(error500, req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('handles errors without any custom properties', () => {
    const error = new Error()
    
    errorHandler(error, req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
      errors: [],
    })
  })
})

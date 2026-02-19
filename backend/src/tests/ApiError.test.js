import { describe, expect, it } from 'vitest'
import { ApiError } from '../utils/ApiError.js'

describe('ApiError', () => {
  it('creates an error with default message', () => {
    const error = new ApiError(400)
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Something went wrong')
    expect(error.success).toBe(false)
    expect(error.data).toBeNull()
    expect(error.errors).toEqual([])
  })

  it('creates an error with custom message', () => {
    const error = new ApiError(404, 'Resource not found')
    
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Resource not found')
    expect(error.success).toBe(false)
  })

  it('creates an error with errors array', () => {
    const errors = [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password is required' },
    ]
    const error = new ApiError(400, 'Validation failed', errors)
    
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Validation failed')
    expect(error.errors).toEqual(errors)
    expect(error.success).toBe(false)
  })

  it('creates an error with custom stack trace', () => {
    const customStack = 'Custom stack trace'
    const error = new ApiError(500, 'Server error', [], customStack)
    
    expect(error.stack).toBe(customStack)
  })

  it('generates automatic stack trace when not provided', () => {
    const error = new ApiError(500, 'Server error')
    
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('ApiError')
  })

  it('supports various HTTP status codes', () => {
    const error400 = new ApiError(400, 'Bad Request')
    const error401 = new ApiError(401, 'Unauthorized')
    const error403 = new ApiError(403, 'Forbidden')
    const error404 = new ApiError(404, 'Not Found')
    const error500 = new ApiError(500, 'Internal Server Error')
    
    expect(error400.statusCode).toBe(400)
    expect(error401.statusCode).toBe(401)
    expect(error403.statusCode).toBe(403)
    expect(error404.statusCode).toBe(404)
    expect(error500.statusCode).toBe(500)
  })

  it('maintains Error prototype chain', () => {
    const error = new ApiError(400, 'Test error')
    
    expect(error instanceof Error).toBe(true)
    expect(error instanceof ApiError).toBe(true)
    expect(error.name).toBe('Error')
  })

  it('can be thrown and caught', () => {
    expect(() => {
      throw new ApiError(400, 'Test error')
    }).toThrow('Test error')
    
    try {
      throw new ApiError(404, 'Not found')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('Not found')
    }
  })
})

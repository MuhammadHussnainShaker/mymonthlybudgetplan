import { describe, expect, it } from 'vitest'
import { ApiResponse } from '../utils/ApiResponse.js'

describe('ApiResponse', () => {
  it('creates a successful response with default message', () => {
    const data = { id: 1, name: 'Test' }
    const response = new ApiResponse(200, data)
    
    expect(response.statusCode).toBe(200)
    expect(response.data).toEqual(data)
    expect(response.message).toBe('Success')
    expect(response.success).toBe(true)
  })

  it('creates a successful response with custom message', () => {
    const data = { id: 1 }
    const response = new ApiResponse(201, data, 'Resource created')
    
    expect(response.statusCode).toBe(201)
    expect(response.data).toEqual(data)
    expect(response.message).toBe('Resource created')
    expect(response.success).toBe(true)
  })

  it('marks response as unsuccessful for status codes >= 400', () => {
    const response400 = new ApiResponse(400, null, 'Bad Request')
    const response404 = new ApiResponse(404, null, 'Not Found')
    const response500 = new ApiResponse(500, null, 'Server Error')
    
    expect(response400.success).toBe(false)
    expect(response404.success).toBe(false)
    expect(response500.success).toBe(false)
  })

  it('marks response as successful for status codes < 400', () => {
    const response200 = new ApiResponse(200, {})
    const response201 = new ApiResponse(201, {})
    const response204 = new ApiResponse(204, null)
    
    expect(response200.success).toBe(true)
    expect(response201.success).toBe(true)
    expect(response204.success).toBe(true)
  })

  it('handles null data', () => {
    const response = new ApiResponse(204, null, 'No content')
    
    expect(response.statusCode).toBe(204)
    expect(response.data).toBeNull()
    expect(response.message).toBe('No content')
    expect(response.success).toBe(true)
  })

  it('handles array data', () => {
    const data = [{ id: 1 }, { id: 2 }]
    const response = new ApiResponse(200, data, 'List retrieved')
    
    expect(response.data).toEqual(data)
    expect(response.data).toHaveLength(2)
  })

  it('handles object data', () => {
    const data = {
      user: { id: 1, name: 'John' },
      token: 'abc123',
    }
    const response = new ApiResponse(200, data, 'Login successful')
    
    expect(response.data).toEqual(data)
    expect(response.data.user).toBeDefined()
    expect(response.data.token).toBe('abc123')
  })

  it('supports various HTTP status codes', () => {
    const response200 = new ApiResponse(200, {}, 'OK')
    const response201 = new ApiResponse(201, {}, 'Created')
    const response204 = new ApiResponse(204, null, 'No Content')
    const response400 = new ApiResponse(400, null, 'Bad Request')
    const response401 = new ApiResponse(401, null, 'Unauthorized')
    const response404 = new ApiResponse(404, null, 'Not Found')
    const response500 = new ApiResponse(500, null, 'Server Error')
    
    expect(response200.statusCode).toBe(200)
    expect(response201.statusCode).toBe(201)
    expect(response204.statusCode).toBe(204)
    expect(response400.statusCode).toBe(400)
    expect(response401.statusCode).toBe(401)
    expect(response404.statusCode).toBe(404)
    expect(response500.statusCode).toBe(500)
  })

  it('can be serialized to JSON', () => {
    const data = { id: 1, name: 'Test' }
    const response = new ApiResponse(200, data, 'Success')
    const json = JSON.stringify(response)
    const parsed = JSON.parse(json)
    
    expect(parsed.statusCode).toBe(200)
    expect(parsed.data).toEqual(data)
    expect(parsed.message).toBe('Success')
    expect(parsed.success).toBe(true)
  })
})

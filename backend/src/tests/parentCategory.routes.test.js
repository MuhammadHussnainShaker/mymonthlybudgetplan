import request from 'supertest'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'
import { app } from '../app.js'

describe('Parent Category Routes - /api/v1/parent-categories', () => {
  let authToken
  let userId

  beforeEach(async () => {
    // Create test user and get JWT token
    const testUser = await createTestUserWithToken({
      displayName: 'Category Test User',
    })
    authToken = testUser.token
    userId = testUser.userId
  })

  describe('POST /api/v1/parent-categories/', () => {
    it('should create a new parent category with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Parent Category created successfully')
      expect(res.body.data).toBeDefined()
      expect(res.body.data.description).toBe('Housing')
      expect(res.body.data.userId).toBe(userId)
    })

    it('should return 400 if description is missing', async () => {
      const res = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain(
        'Description for parent category record is required',
      )
    })

    it('should return 400 if month is missing', async () => {
      const res = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain(
        'Month for parent category record is required',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).post('/api/v1/parent-categories/').send({
        description: 'Housing',
        month: '2026-01-01T00:00:00.000Z',
      })

      expect(res.status).toBe(401)
    })

    it('should trim whitespace from description', async () => {
      const res = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '  Housing  ',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBe('Housing')
    })

    it('should allow creating multiple categories for the same month', async () => {
      await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing',
          month: '2026-01-01T00:00:00.000Z',
        })

      const res = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Transportation',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBe('Transportation')
    })
  })

  describe('GET /api/v1/parent-categories/:month', () => {
    beforeEach(async () => {
      // Create some test parent categories
      await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing Jan',
          month: '2026-01-01T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Transportation Jan',
          month: '2026-01-15T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing Feb',
          month: '2026-02-01T00:00:00.000Z',
        })
    })

    it('should get all parent categories for a specific month', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/parent-categories/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].description).toBe('Housing Jan')
      expect(res.body.data[1].description).toBe('Transportation Jan')
    })

    it('should return empty array if no categories for the month', async () => {
      const month = '2026-03-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/parent-categories/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return 401 if no auth token is provided', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app).get(
        `/api/v1/parent-categories/${encodeURIComponent(month)}`,
      )

      expect(res.status).toBe(401)
    })

    it('should return 404 if GET request without month parameter', async () => {
      const res = await request(app)
        .get('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
    })

    it('should only return categories for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Create category for other user
      await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Other User Category',
          month: '2026-01-01T00:00:00.000Z',
        })

      // Get categories for first user
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/parent-categories/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2) // Should not include other user's category
      expect(
        res.body.data.every(
          (category) => category.description !== 'Other User Category',
        ),
      ).toBe(true)
    })
  })

  describe('PATCH /api/v1/parent-categories/:parentCategoryId', () => {
    let categoryId

    beforeEach(async () => {
      // Create a test category
      const createRes = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing',
          month: '2026-01-01T00:00:00.000Z',
        })

      categoryId = createRes.body.data._id
    })

    it('should update parent category description', async () => {
      const res = await request(app)
        .patch(`/api/v1/parent-categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Housing',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe(
        'The parent category is updated successfully',
      )
      expect(res.body.data.description).toBe('Updated Housing')
    })

    it('should return 400 if no fields are provided to update', async () => {
      const res = await request(app)
        .patch(`/api/v1/parent-categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'At least one field must be provided to update',
      )
    })

    it('should return 400 if invalid category ID format', async () => {
      const res = await request(app)
        .patch('/api/v1/parent-categories/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid parent category ID format')
    })

    it('should return 404 if category not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .patch(`/api/v1/parent-categories/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Parent category not found or unauthorized',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app)
        .patch(`/api/v1/parent-categories/${categoryId}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(401)
    })

    it('should not allow user to update another users category', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Try to update first user's category with other user's token
      const res = await request(app)
        .patch(`/api/v1/parent-categories/${categoryId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Hacked',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Parent category not found or unauthorized',
      )
    })

    it('should trim whitespace from description', async () => {
      const res = await request(app)
        .patch(`/api/v1/parent-categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '  Updated Housing  ',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.description).toBe('Updated Housing')
    })
  })

  describe('DELETE /api/v1/parent-categories/:parentCategoryId', () => {
    let categoryId

    beforeEach(async () => {
      // Create a test category
      const createRes = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Housing',
          month: '2026-01-01T00:00:00.000Z',
        })

      categoryId = createRes.body.data._id
    })

    it('should delete a parent category', async () => {
      const res = await request(app)
        .delete(`/api/v1/parent-categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe(
        'The parent category record is deleted successfully',
      )

      // Verify it's deleted by trying to get it
      const month = '2026-01-01T00:00:00.000Z'
      const getRes = await request(app)
        .get(`/api/v1/parent-categories/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(getRes.body.data).toHaveLength(0)
    })

    it('should return 400 if invalid category ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/parent-categories/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid parent category ID format')
    })

    it('should return 404 if category not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/parent-categories/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Parent category not found or you do not have permission to delete it',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).delete(
        `/api/v1/parent-categories/${categoryId}`,
      )

      expect(res.status).toBe(401)
    })

    it('should not allow user to delete another users category', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Try to delete first user's category with other user's token
      const res = await request(app)
        .delete(`/api/v1/parent-categories/${categoryId}`)
        .set('Authorization', `Bearer ${otherToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Parent category not found or you do not have permission to delete it',
      )
    })
  })
})

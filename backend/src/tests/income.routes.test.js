import request from 'supertest'
import { app } from '../app.js'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'

describe('Income Routes - /api/v1/incomes', () => {
  let authToken
  let userId

  beforeEach(async () => {
    // Create test user and get JWT token
    const testUser = await createTestUserWithToken({
      displayName: 'Income Test User',
    })
    authToken = testUser.token
    userId = testUser.userId
  })

  describe('POST /api/v1/incomes/', () => {
    it('should create a new income record with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Monthly Salary',
          projectedAmount: 5000,
          actualAmount: 5000,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Income record created successfully')
      expect(res.body.data).toBeDefined()
      expect(res.body.data.description).toBe('Monthly Salary')
      expect(res.body.data.projectedAmount).toBe(5000)
      expect(res.body.data.actualAmount).toBe(5000)
      expect(res.body.data.userId).toBe(userId)
    })

    it('should create income with default amounts if not provided', async () => {
      const res = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Freelance Work',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.projectedAmount).toBe(0)
      expect(res.body.data.actualAmount).toBe(0)
    })

    it('should return 400 if description is missing', async () => {
      const res = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectedAmount: 5000,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain(
        'Description for income record is required',
      )
    })

    it('should return 400 if month is missing', async () => {
      const res = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Monthly Salary',
          projectedAmount: 5000,
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Month for income record is required')
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).post('/api/v1/incomes/').send({
        description: 'Monthly Salary',
        projectedAmount: 5000,
        month: '2026-01-01T00:00:00.000Z',
      })

      expect(res.status).toBe(401)
    })

    it('should trim whitespace from description', async () => {
      const res = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '  Freelance Work  ',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBe('Freelance Work')
    })
  })

  describe('GET /api/v1/incomes/:month', () => {
    beforeEach(async () => {
      // Create some test income records
      await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Salary Jan',
          projectedAmount: 5000,
          actualAmount: 5000,
          month: '2026-01-01T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Bonus Jan',
          projectedAmount: 1000,
          actualAmount: 1000,
          month: '2026-01-15T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Salary Feb',
          projectedAmount: 5000,
          actualAmount: 5000,
          month: '2026-02-01T00:00:00.000Z',
        })
    })

    it('should get all incomes for a specific month', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/incomes/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].description).toBe('Salary Jan')
      expect(res.body.data[1].description).toBe('Bonus Jan')
    })

    it('should return empty array if no incomes for the month', async () => {
      const month = '2026-03-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/incomes/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return 401 if no auth token is provided', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app).get(
        `/api/v1/incomes/${encodeURIComponent(month)}`,
      )

      expect(res.status).toBe(401)
    })

    it('should return 404 if GET request without month parameter', async () => {
      const res = await request(app)
        .get('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
    })

    it('should only return incomes for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Create income for other user
      await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Other User Income',
          projectedAmount: 3000,
          month: '2026-01-01T00:00:00.000Z',
        })

      // Get incomes for first user
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/incomes/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2) // Should not include other user's income
      expect(
        res.body.data.every(
          (income) => income.description !== 'Other User Income',
        ),
      ).toBe(true)
    })
  })

  describe('PATCH /api/v1/incomes/:incomeId', () => {
    let incomeId

    beforeEach(async () => {
      // Create a test income
      const createRes = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Salary',
          projectedAmount: 5000,
          actualAmount: 5000,
          month: '2026-01-01T00:00:00.000Z',
        })

      incomeId = createRes.body.data._id
    })

    it('should update income description', async () => {
      const res = await request(app)
        .patch(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Salary',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('The income record is updated successfully')
      expect(res.body.data.description).toBe('Updated Salary')
      expect(res.body.data.projectedAmount).toBe(5000) // Should remain unchanged
      expect(res.body.data.actualAmount).toBe(5000)
    })

    it('should update projectedAmount', async () => {
      const res = await request(app)
        .patch(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectedAmount: 6000,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.projectedAmount).toBe(6000)
      expect(res.body.data.description).toBe('Salary') // Should remain unchanged
    })

    it('should update actualAmount', async () => {
      const res = await request(app)
        .patch(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actualAmount: 5500,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.actualAmount).toBe(5500)
    })

    it('should update multiple fields at once', async () => {
      const res = await request(app)
        .patch(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'New Description',
          projectedAmount: 7000,
          actualAmount: 6500,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.description).toBe('New Description')
      expect(res.body.data.projectedAmount).toBe(7000)
      expect(res.body.data.actualAmount).toBe(6500)
    })

    it('should return 400 if no fields are provided to update', async () => {
      const res = await request(app)
        .patch(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'At least one field must be provided to update',
      )
    })

    it('should return 400 if invalid income ID format', async () => {
      const res = await request(app)
        .patch('/api/v1/incomes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid Income ID format')
    })

    it('should return 404 if income not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .patch(`/api/v1/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Income record not found or unauthorized',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).patch(`/api/v1/incomes/${incomeId}`).send({
        description: 'Updated',
      })

      expect(res.status).toBe(401)
    })

    it('should not allow user to update another users income', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Try to update first user's income with other user's token
      const res = await request(app)
        .patch(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Hacked',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Income record not found or unauthorized',
      )
    })
  })

  describe('DELETE /api/v1/incomes/:incomeId', () => {
    let incomeId

    beforeEach(async () => {
      // Create a test income
      const createRes = await request(app)
        .post('/api/v1/incomes/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Salary',
          projectedAmount: 5000,
          actualAmount: 5000,
          month: '2026-01-01T00:00:00.000Z',
        })

      incomeId = createRes.body.data._id
    })

    it('should delete an income record', async () => {
      const res = await request(app)
        .delete(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('The income record is deleted successfully')

      // Verify it's deleted by trying to get it
      const month = '2026-01-01T00:00:00.000Z'
      const getRes = await request(app)
        .get(`/api/v1/incomes/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(getRes.body.data).toHaveLength(0)
    })

    it('should return 400 if invalid income ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/incomes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid Income ID format')
    })

    it('should return 404 if income not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Income record not found or you do not have permission to delete it',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).delete(`/api/v1/incomes/${incomeId}`)

      expect(res.status).toBe(401)
    })

    it('should not allow user to delete another users income', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Try to delete first user's income with other user's token
      const res = await request(app)
        .delete(`/api/v1/incomes/${incomeId}`)
        .set('Authorization', `Bearer ${otherToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Income record not found or you do not have permission to delete it',
      )
    })
  })
})

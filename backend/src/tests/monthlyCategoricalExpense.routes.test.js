import request from 'supertest'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'
import { app } from '../app.js'

const hasDockerSupport = process.env.DOCKER_TESTS || false
const testOrSkip = hasDockerSupport ? it : it.skip

describe('Monthly Categorical Expense Routes - /api/v1/monthly-categorical-expenses', () => {
  let authToken
  let userId
  let parentCategoryId

  beforeEach(async () => {
    // Create test user and get JWT token
    const testUser = await createTestUserWithToken({
      displayName: 'Monthly Expense Test User',
    })
    authToken = testUser.token
    userId = testUser.userId

    // Create a parent category for testing
    const parentRes = await request(app)
      .post('/api/v1/parent-categories/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Housing',
        month: '2026-01-01T00:00:00.000Z',
      })

    parentCategoryId = parentRes.body.data._id
  })

  describe('POST /api/v1/monthly-categorical-expenses/', () => {
    it('should create a new monthly categorical expense with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Rent',
          projectedAmount: 1500,
          actualAmount: 1500,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe(
        'Monthly categorical expense created successfully',
      )
      expect(res.body.data).toBeDefined()
      expect(res.body.data.description).toBe('Rent')
      expect(res.body.data.projectedAmount).toBe(1500)
      expect(res.body.data.actualAmount).toBe(1500)
      expect(res.body.data.userId).toBe(userId)
      expect(res.body.data.parentId).toBe(parentCategoryId)
    })

    it('should default selectable to true when not provided', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Groceries',
          projectedAmount: 500,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.selectable).toBe(true)
    })

    it('should create expense with default amounts if not provided', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Utilities',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.projectedAmount).toBe(0)
      expect(res.body.data.actualAmount).toBe(0)
    })

    it('should return 400 if description is missing', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          projectedAmount: 1500,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain(
        'Description for monthly categorical expense is required',
      )
    })

    it('should return 400 if month is missing', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Rent',
          projectedAmount: 1500,
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain(
        'Month for monthly categorical expense is required',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .send({
          parentId: parentCategoryId,
          description: 'Rent',
          projectedAmount: 1500,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(401)
    })

    it('should trim whitespace from description', async () => {
      const res = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: '  Rent  ',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBe('Rent')
    })
  })

  describe('GET /api/v1/monthly-categorical-expenses/:month', () => {
    beforeEach(async () => {
      // Create some test monthly categorical expenses
      await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Rent Jan',
          projectedAmount: 1500,
          actualAmount: 1500,
          month: '2026-01-01T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Utilities Jan',
          projectedAmount: 200,
          actualAmount: 180,
          month: '2026-01-15T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Rent Feb',
          projectedAmount: 1500,
          actualAmount: 1500,
          month: '2026-02-01T00:00:00.000Z',
        })
    })

    it('should get all monthly categorical expenses for a specific month', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(
          `/api/v1/monthly-categorical-expenses/${encodeURIComponent(month)}`,
        )
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].description).toBe('Rent Jan')
      expect(res.body.data[1].description).toBe('Utilities Jan')
    })

    it('should return empty array if no expenses for the month', async () => {
      const month = '2026-03-01T00:00:00.000Z'
      const res = await request(app)
        .get(
          `/api/v1/monthly-categorical-expenses/${encodeURIComponent(month)}`,
        )
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return 401 if no auth token is provided', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app).get(
        `/api/v1/monthly-categorical-expenses/${encodeURIComponent(month)}`,
      )

      expect(res.status).toBe(401)
    })

    it('should only return expenses for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Create parent category for other user
      const otherParentRes = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Housing',
          month: '2026-01-01T00:00:00.000Z',
        })

      // Create expense for other user
      await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          parentId: otherParentRes.body.data._id,
          description: 'Other User Expense',
          projectedAmount: 2000,
          month: '2026-01-01T00:00:00.000Z',
        })

      // Get expenses for first user
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(
          `/api/v1/monthly-categorical-expenses/${encodeURIComponent(month)}`,
        )
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2) // Should not include other user's expense
      expect(
        res.body.data.every(
          (expense) => expense.description !== 'Other User Expense',
        ),
      ).toBe(true)
    })
  })

  describe('PATCH /api/v1/monthly-categorical-expenses/:monthlyCategoricalExpenseId', () => {
    let expenseId

    beforeEach(async () => {
      // Create a test expense
      const createRes = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Rent',
          projectedAmount: 1500,
          actualAmount: 1500,
          month: '2026-01-01T00:00:00.000Z',
        })

      expenseId = createRes.body.data._id
    })

    it('should update expense description', async () => {
      const res = await request(app)
        .patch(`/api/v1/monthly-categorical-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Rent',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe(
        'The monthly categorical expense record is updated successfully',
      )
      expect(res.body.data.description).toBe('Updated Rent')
      expect(res.body.data.projectedAmount).toBe(1500) // Should remain unchanged
    })

    it('should update projectedAmount', async () => {
      const res = await request(app)
        .patch(`/api/v1/monthly-categorical-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectedAmount: 1600,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.projectedAmount).toBe(1600)
    })

    // it('should update actualAmount only when selectable is true not false', async () => {
    // it('should update actualAmount only when selectable is false', async () => {
    //   const res = await request(app)
    //     .patch(`/api/v1/monthly-categorical-expenses/${expenseId}`)
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .send({
    //       actualAmount: 1550,
    //     })

    //   console.log('res', res)

    //   expect(res.status).toBe(200)
    //   expect(res.body.data.actualAmount).toBe(1550)
    // }, 10000)

    it('should return 400 if no fields are provided to update', async () => {
      const res = await request(app)
        .patch(`/api/v1/monthly-categorical-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'At least one field must be provided to update',
      )
    })

    it('should return 400 if invalid expense ID format', async () => {
      const res = await request(app)
        .patch('/api/v1/monthly-categorical-expenses/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'Invalid monthly categorical expense ID format',
      )
    })

    it('should return 404 if expense not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .patch(`/api/v1/monthly-categorical-expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Monthly categorical expense record not found or unauthorized',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app)
        .patch(`/api/v1/monthly-categorical-expenses/${expenseId}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/v1/monthly-categorical-expenses/:monthlyCategoricalExpenseId', () => {
    let expenseId

    beforeEach(async () => {
      // Create a test expense
      const createRes = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Rent',
          projectedAmount: 1500,
          actualAmount: 1500,
          month: '2026-01-01T00:00:00.000Z',
        })

      expenseId = createRes.body.data._id
    })

    it('should delete a monthly categorical expense', async () => {
      const res = await request(app)
        .delete(`/api/v1/monthly-categorical-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe(
        'The monthly categorical expense record is deleted successfully',
      )

      // Verify it's deleted by trying to get it
      const month = '2026-01-01T00:00:00.000Z'
      const getRes = await request(app)
        .get(
          `/api/v1/monthly-categorical-expenses/${encodeURIComponent(month)}`,
        )
        .set('Authorization', `Bearer ${authToken}`)

      expect(getRes.body.data).toHaveLength(0)
    })

    it('should return 400 if invalid expense ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/monthly-categorical-expenses/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'Invalid monthly categorical expense ID format',
      )
    })

    it('should return 404 if expense not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/monthly-categorical-expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Monthly categorical expense record not found or you do not have permission to delete it',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).delete(
        `/api/v1/monthly-categorical-expenses/${expenseId}`,
      )

      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/v1/monthly-categorical-expenses/:monthlyCategoricalExpenseId/toggle-selectable/:month', () => {
    let expenseId

    beforeEach(async () => {
      // Create a test expense
      const createRes = await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentCategoryId,
          description: 'Groceries',
          projectedAmount: 500,
          actualAmount: 0,
          month: '2026-01-01T00:00:00.000Z',
        })

      expenseId = createRes.body.data._id
    })

    // Test expects route to be removed/return 404 (route will be commented out in future)
    testOrSkip('should return 404 when route is not found', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .patch(
          `/api/v1/monthly-categorical-expenses/${expenseId}/toggle-selectable/${encodeURIComponent(month)}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          selectable: false,
        })

      // Route should be removed, expecting 404
      expect(res.status).toBe(404)
    })
  })
})

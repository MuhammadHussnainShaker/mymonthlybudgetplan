import request from 'supertest'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'
import { app } from '../app.js'

const hasDockerSupport = process.env.DOCKER_TESTS || false
const testOrSkip = hasDockerSupport ? it : it.skip

describe('Daily Expense Routes - /api/v1/daily-expense', () => {
  let authToken
  let userId

  beforeEach(async () => {
    // Create test user and get JWT token
    const testUser = await createTestUserWithToken({
      displayName: 'Daily Expense Test User',
    })
    authToken = testUser.token
    userId = testUser.userId
  })

  describe('POST /api/v1/daily-expense/', () => {
    it('should create a new daily expense with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: 25.5,
          date: '2026-01-15T12:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Daily expense created successfully')
      expect(res.body.data).toBeDefined()
      expect(res.body.data.description).toBe('Lunch')
      expect(res.body.data.amount).toBe(25.5)
      expect(res.body.data.userId).toBe(userId)
    })

    it('should return 400 if description is missing', async () => {
      const res = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 25.5,
          date: '2026-01-15T12:00:00.000Z',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain(
        'Description for daily expense is required',
      )
    })

    it('should return 400 if date is missing', async () => {
      const res = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: 25.5,
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Date for daily expense is required')
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).post('/api/v1/daily-expense/').send({
        description: 'Lunch',
        amount: 25.5,
        date: '2026-01-15T12:00:00.000Z',
      })

      expect(res.status).toBe(401)
    })

    it('should trim whitespace from description', async () => {
      const res = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '  Lunch  ',
          amount: 25.5,
          date: '2026-01-15T12:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBe('Lunch')
    })

    it('should create daily expense with amount as 0 if not provided', async () => {
      const res = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Free Sample',
          date: '2026-01-15T12:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.amount).toBeDefined()
    })
  })

  describe('GET /api/v1/daily-expense/', () => {
    beforeEach(async () => {
      // Create some test daily expenses
      await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Breakfast Jan 15',
          amount: 15,
          date: '2026-01-15T08:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch Jan 15',
          amount: 25,
          date: '2026-01-15T12:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Breakfast Jan 16',
          amount: 12,
          date: '2026-01-16T08:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Breakfast Feb 1',
          amount: 10,
          date: '2026-02-01T08:00:00.000Z',
        })
    })

    it('should get all daily expenses for a specific date', async () => {
      const date = '2026-01-15'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ date })
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.dailyExpenses).toBeDefined()
      expect(Array.isArray(res.body.data.dailyExpenses)).toBe(true)
      expect(res.body.data.dailyExpenses).toHaveLength(2)
      expect(res.body.data.dailyExpenses[0].description).toBe(
        'Breakfast Jan 15',
      )
      expect(res.body.data.dailyExpenses[1].description).toBe('Lunch Jan 15')
    })

    it('should get all daily expenses for a specific month', async () => {
      const month = '2026-01'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ month })
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.dailyExpenses).toBeDefined()
      expect(Array.isArray(res.body.data.dailyExpenses)).toBe(true)
      expect(res.body.data.dailyExpenses).toHaveLength(3)
    })

    it('should return empty array if no expenses for the date', async () => {
      const date = '2026-03-15'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ date })
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.dailyExpenses)).toBe(true)
      expect(res.body.data.dailyExpenses).toHaveLength(0)
    })

    it('should return 400 if neither date nor month is provided', async () => {
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Please provide a date or a month')
    })

    it('should return 401 if no auth token is provided', async () => {
      const date = '2026-01-15'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ date })

      expect(res.status).toBe(401)
    })

    it('should only return expenses for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
          displayName: 'Other User',
      })
        const otherToken = otherUser.token

      // Create expense for other user
      await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Other User Expense',
          amount: 100,
          date: '2026-01-15T12:00:00.000Z',
        })

      // Get expenses for first user
      const date = '2026-01-15'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ date })
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.dailyExpenses).toHaveLength(2) // Should not include other user's expense
      expect(
        res.body.data.dailyExpenses.every(
          (expense) => expense.description !== 'Other User Expense',
        ),
      ).toBe(true)
    })

    it('should return 400 if month format is invalid', async () => {
      const month = 'invalid-month'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ month })
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid month format')
    })

    it('should include selectable categorical expenses when querying by date', async () => {
      // Create a parent category
      const parentRes = await request(app)
        .post('/api/v1/parent-categories/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Food',
          month: '2026-01-01T00:00:00.000Z',
        })

      // Create a monthly categorical expense (defaults to selectable = true)
      await request(app)
        .post('/api/v1/monthly-categorical-expenses/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentId: parentRes.body.data._id,
          description: 'Groceries',
          projectedAmount: 500,
          month: '2026-01-01T00:00:00.000Z',
        })

      // Query daily expenses for a date in the same month
      const date = '2026-01-15'
      const res = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ date })
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.selectableCategoricalExpenses).toBeDefined()
      expect(Array.isArray(res.body.data.selectableCategoricalExpenses)).toBe(
        true,
      )
    })
  })

  describe('PATCH /api/v1/daily-expense/:dailyExpenseId', () => {
    let expenseId

    beforeEach(async () => {
      // Create a test expense
      const createRes = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: 25,
          date: '2026-01-15T12:00:00.000Z',
        })

      expenseId = createRes.body.data._id
    })

    testOrSkip('should update daily expense description', async () => {
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Lunch',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('The daily expense is updated successfully')
      expect(res.body.data.description).toBe('Updated Lunch')
      expect(res.body.data.amount).toBe(25) // Should remain unchanged
    })

    testOrSkip('should update amount', async () => {
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 30,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.amount).toBe(30)
      expect(res.body.data.description).toBe('Lunch') // Should remain unchanged
    })

    testOrSkip('should update multiple fields at once', async () => {
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Dinner',
          amount: 40,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.description).toBe('Dinner')
      expect(res.body.data.amount).toBe(40)
    })

    it('should return 400 if no fields are provided to update', async () => {
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'At least one field must be provided to update',
      )
    })

    it('should return 400 if invalid expense ID format', async () => {
      const res = await request(app)
        .patch('/api/v1/daily-expense/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid daily expense ID format')
    })

    testOrSkip('should return 404 if expense not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Daily expense not found or unauthorized',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${expenseId}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(401)
    })

    testOrSkip(
      'should not allow user to update another users expense',
      async () => {
        // Create another user
        const otherUser = await createTestUserWithToken({
          displayName: 'Other User',
      })
        const otherToken = otherUser.token

        // Try to update first user's expense with other user's token
        const res = await request(app)
          .patch(`/api/v1/daily-expense/${expenseId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({
            description: 'Hacked',
          })

        expect(res.status).toBe(404)
        expect(res.body.message).toContain(
          'Daily expense not found or unauthorized',
        )
      },
    )

    testOrSkip('should trim whitespace from description', async () => {
      const res = await request(app)
        .patch(`/api/v1/daily-expense/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '  Updated Lunch  ',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.description).toBe('Updated Lunch')
    })
  })

  describe('DELETE /api/v1/daily-expense/:dailyExpenseId', () => {
    let expenseId

    beforeEach(async () => {
      // Create a test expense
      const createRes = await request(app)
        .post('/api/v1/daily-expense/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: 25,
          date: '2026-01-15T12:00:00.000Z',
        })

      expenseId = createRes.body.data._id
    })

    testOrSkip('should delete a daily expense', async () => {
      const res = await request(app)
        .delete(`/api/v1/daily-expense/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('The daily expense is deleted successfully')

      // Verify it's deleted by trying to get it
      const date = '2026-01-15'
      const getRes = await request(app)
        .get('/api/v1/daily-expense/')
        .query({ date })
        .set('Authorization', `Bearer ${authToken}`)

      expect(getRes.body.data.dailyExpenses).toHaveLength(0)
    })

    it('should return 400 if invalid expense ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/daily-expense/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid daily expense ID format')
    })

    testOrSkip('should return 404 if expense not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/daily-expense/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Daily expense not found or you do not have permission to delete it',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).delete(
        `/api/v1/daily-expense/${expenseId}`,
      )

      expect(res.status).toBe(401)
    })

    testOrSkip(
      'should not allow user to delete another users expense',
      async () => {
        // Create another user
        const otherUser = await createTestUserWithToken({
          displayName: 'Other User',
      })
        const otherToken = otherUser.token

        // Try to delete first user's expense with other user's token
        const res = await request(app)
          .delete(`/api/v1/daily-expense/${expenseId}`)
          .set('Authorization', `Bearer ${otherToken}`)

        expect(res.status).toBe(404)
        expect(res.body.message).toContain(
          'Daily expense not found or you do not have permission to delete it',
        )
      },
    )
  })
})

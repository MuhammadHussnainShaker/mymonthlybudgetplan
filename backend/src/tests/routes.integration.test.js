import request from 'supertest'
import { app } from '../app.js'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'

describe('Integration - Complete Workflow', () => {
  let authToken
  const testMonth = '2026-01-01T00:00:00.000Z'

  beforeEach(async () => {
    const testUser = await createTestUserWithToken({
      displayName: 'Integration User',
    })
    authToken = testUser.token
  })

  it('supports a complete budget tracking workflow', async () => {
    const incomeRes = await request(app)
      .post('/api/v1/incomes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Monthly Salary',
        projectedAmount: 5000,
        actualAmount: 5000,
        month: testMonth,
      })
    expect(incomeRes.status).toBe(201)

    const savingRes = await request(app)
      .post('/api/v1/savings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Emergency Fund',
        projectedAmount: 500,
        actualAmount: 500,
        month: testMonth,
      })
    expect(savingRes.status).toBe(201)

    const categoryRes = await request(app)
      .post('/api/v1/parent-categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Food & Dining',
        month: testMonth,
      })
    expect(categoryRes.status).toBe(201)
    const parentCategoryId = categoryRes.body.data._id

    const monthlyExpenseRes = await request(app)
      .post('/api/v1/monthly-categorical-expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        parentId: parentCategoryId,
        description: 'Groceries',
        projectedAmount: 400,
        actualAmount: 0,
        month: testMonth,
      })
    expect(monthlyExpenseRes.status).toBe(201)

    const dailyExpense1 = await request(app)
      .post('/api/v1/daily-expense')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Grocery Shopping',
        amount: 50.0,
        date: '2026-01-05T10:00:00.000Z',
      })
    expect(dailyExpense1.status).toBe(201)

    const dailyExpense2 = await request(app)
      .post('/api/v1/daily-expense')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Restaurant',
        amount: 30.0,
        date: '2026-01-10T19:00:00.000Z',
      })
    expect(dailyExpense2.status).toBe(201)

    const getIncomes = await request(app)
      .get(`/api/v1/incomes/${encodeURIComponent(testMonth)}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(getIncomes.body.data.length).toBeGreaterThan(0)

    const getSavings = await request(app)
      .get(`/api/v1/savings/${encodeURIComponent(testMonth)}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(getSavings.body.data.length).toBeGreaterThan(0)

    const getCategories = await request(app)
      .get(`/api/v1/parent-categories/${encodeURIComponent(testMonth)}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(getCategories.body.data.length).toBeGreaterThan(0)

    const getMonthlyExpenses = await request(app)
      .get(
        `/api/v1/monthly-categorical-expenses/${encodeURIComponent(testMonth)}`,
      )
      .set('Authorization', `Bearer ${authToken}`)
    expect(getMonthlyExpenses.body.data.length).toBeGreaterThan(0)

    const getDailyExpenses = await request(app)
      .get('/api/v1/daily-expense?month=2026-01')
      .set('Authorization', `Bearer ${authToken}`)
    expect(getDailyExpenses.body.data.dailyExpenses.length).toBe(2)
  })
})

import request from 'supertest'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'
import { app } from '../app.js'

describe('Saving Routes - /api/v1/savings', () => {
  let authToken
  let userId

  beforeEach(async () => {
    // Create test user and get JWT token
    const testUser = await createTestUserWithToken({
      displayName: 'Saving Test User',
    })
    authToken = testUser.token
    userId = testUser.userId
  })

  describe('POST /api/v1/savings/', () => {
    it('should create a new saving record with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Emergency Fund',
          projectedAmount: 1000,
          actualAmount: 800,
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Saving record created successfully')
      expect(res.body.data).toBeDefined()
      expect(res.body.data.description).toBe('Emergency Fund')
      expect(res.body.data.projectedAmount).toBe(1000)
      expect(res.body.data.actualAmount).toBe(800)
      expect(res.body.data.userId).toBe(userId)
    })

    it('should create saving with default amounts if not provided', async () => {
      const res = await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Vacation Fund',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.projectedAmount).toBe(0)
      expect(res.body.data.actualAmount).toBe(0)
    })

    it('should return 400 if description is missing', async () => {
      const res = await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectedAmount: 1000,
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
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Emergency Fund',
          projectedAmount: 1000,
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Month for income record is required')
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).post('/api/v1/savings/').send({
        description: 'Emergency Fund',
        projectedAmount: 1000,
        month: '2026-01-01T00:00:00.000Z',
      })

      expect(res.status).toBe(401)
    })

    it('should trim whitespace from description', async () => {
      const res = await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '  Emergency Fund  ',
          month: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBe('Emergency Fund')
    })
  })

  describe('GET /api/v1/savings/:month', () => {
    beforeEach(async () => {
      // Create some test saving records
      await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Emergency Fund Jan',
          projectedAmount: 1000,
          actualAmount: 800,
          month: '2026-01-01T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Vacation Fund Jan',
          projectedAmount: 500,
          actualAmount: 300,
          month: '2026-01-15T00:00:00.000Z',
        })

      await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Emergency Fund Feb',
          projectedAmount: 1000,
          actualAmount: 900,
          month: '2026-02-01T00:00:00.000Z',
        })
    })

    it('should get all savings for a specific month', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/savings/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data[0].description).toBe('Emergency Fund Jan')
      expect(res.body.data[1].description).toBe('Vacation Fund Jan')
    })

    it('should return empty array if no savings for the month', async () => {
      const month = '2026-03-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/savings/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return 401 if no auth token is provided', async () => {
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app).get(
        `/api/v1/savings/${encodeURIComponent(month)}`,
      )

      expect(res.status).toBe(401)
    })

    it('should only return savings for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Create saving for other user
      await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Other User Saving',
          projectedAmount: 2000,
          month: '2026-01-01T00:00:00.000Z',
        })

      // Get savings for first user
      const month = '2026-01-01T00:00:00.000Z'
      const res = await request(app)
        .get(`/api/v1/savings/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2) // Should not include other user's saving
      expect(
        res.body.data.every(
          (saving) => saving.description !== 'Other User Saving',
        ),
      ).toBe(true)
    })
  })

  describe('PATCH /api/v1/savings/:savingId', () => {
    let savingId

    beforeEach(async () => {
      // Create a test saving
      const createRes = await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Emergency Fund',
          projectedAmount: 1000,
          actualAmount: 800,
          month: '2026-01-01T00:00:00.000Z',
        })

      savingId = createRes.body.data._id
    })

    it('should update saving description', async () => {
      const res = await request(app)
        .patch(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Emergency Fund',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('The saving record is updated successfully')
      expect(res.body.data.description).toBe('Updated Emergency Fund')
      expect(res.body.data.projectedAmount).toBe(1000) // Should remain unchanged
      expect(res.body.data.actualAmount).toBe(800)
    })

    it('should update projectedAmount', async () => {
      const res = await request(app)
        .patch(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectedAmount: 1500,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.projectedAmount).toBe(1500)
      expect(res.body.data.description).toBe('Emergency Fund') // Should remain unchanged
    })

    it('should update actualAmount', async () => {
      const res = await request(app)
        .patch(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actualAmount: 900,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.actualAmount).toBe(900)
    })

    it('should update multiple fields at once', async () => {
      const res = await request(app)
        .patch(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'New Description',
          projectedAmount: 2000,
          actualAmount: 1500,
        })

      expect(res.status).toBe(200)
      expect(res.body.data.description).toBe('New Description')
      expect(res.body.data.projectedAmount).toBe(2000)
      expect(res.body.data.actualAmount).toBe(1500)
    })

    it('should return 400 if no fields are provided to update', async () => {
      const res = await request(app)
        .patch(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toContain(
        'At least one field must be provided to update',
      )
    })

    it('should return 400 if invalid saving ID format', async () => {
      const res = await request(app)
        .patch('/api/v1/savings/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid Saving ID format')
    })

    it('should return 404 if saving not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .patch(`/api/v1/savings/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Saving record not found or unauthorized',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).patch(`/api/v1/savings/${savingId}`).send({
        description: 'Updated',
      })

      expect(res.status).toBe(401)
    })

    it('should not allow user to update another users saving', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Try to update first user's saving with other user's token
      const res = await request(app)
        .patch(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Hacked',
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Saving record not found or unauthorized',
      )
    })
  })

  describe('DELETE /api/v1/savings/:savingId', () => {
    let savingId

    beforeEach(async () => {
      // Create a test saving
      const createRes = await request(app)
        .post('/api/v1/savings/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Emergency Fund',
          projectedAmount: 1000,
          actualAmount: 800,
          month: '2026-01-01T00:00:00.000Z',
        })

      savingId = createRes.body.data._id
    })

    it('should delete a saving record', async () => {
      const res = await request(app)
        .delete(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('The saving record is deleted successfully')

      // Verify it's deleted by trying to get it
      const month = '2026-01-01T00:00:00.000Z'
      const getRes = await request(app)
        .get(`/api/v1/savings/${encodeURIComponent(month)}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(getRes.body.data).toHaveLength(0)
    })

    it('should return 400 if invalid saving ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/savings/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Invalid Saving ID format')
    })

    it('should return 404 if saving not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/savings/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Saving record not found or you do not have permission to delete it',
      )
    })

    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app).delete(`/api/v1/savings/${savingId}`)

      expect(res.status).toBe(401)
    })

    it('should not allow user to delete another users saving', async () => {
      // Create another user
      const otherUser = await createTestUserWithToken({
        displayName: 'Other User',
      })
      const otherToken = otherUser.token

      // Try to delete first user's saving with other user's token
      const res = await request(app)
        .delete(`/api/v1/savings/${savingId}`)
        .set('Authorization', `Bearer ${otherToken}`)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain(
        'Saving record not found or you do not have permission to delete it',
      )
    })
  })
})

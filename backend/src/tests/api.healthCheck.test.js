import request from 'supertest'
import { app } from '../app.js'

describe('API smoke tests', () => {
  it('GET /api/v1/health returns ok status', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

import request from 'supertest'
import { app } from '../app.js'

describe('API smoke tests', () => {
  it('GET /test returns the test array', async () => {
    const res = await request(app).get('/test')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })
})

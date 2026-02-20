import { describe, expect, it, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'

// Mock dependencies
vi.mock('../models/savings.model.js', () => ({
  Saving: {
    create: vi.fn(),
    find: vi.fn(() => ({
      sort: vi.fn(() => ({
        lean: vi.fn(() => ({
          exec: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}))

import { createSaving, getSavings } from '../controllers/saving.controller.js'

describe('Saving Controller - Error Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSaving', () => {
    it('throws error with "saving" in message when description is missing', async () => {
      const req = {
        body: { projectedAmount: 100, month: '2026-01-01T00:00:00.000Z' },
        user: { _id: new mongoose.Types.ObjectId() },
      }
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
      const next = vi.fn()

      await createSaving(req, res, next)

      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Description for saving record is required')
      expect(error.message).not.toContain('income')
    })

    it('throws error with "saving" in message when month is missing', async () => {
      const req = {
        body: { description: 'Test', projectedAmount: 100 },
        user: { _id: new mongoose.Types.ObjectId() },
      }
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
      const next = vi.fn()

      await createSaving(req, res, next)

      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Month for saving record is required')
      expect(error.message).not.toContain('income')
    })
  })

  describe('getSavings', () => {
    it('throws error with "saving" in message when month param is missing', async () => {
      const req = {
        params: {},
        user: { _id: new mongoose.Types.ObjectId() },
      }
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
      const next = vi.fn()

      await getSavings(req, res, next)

      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Month is required to get saving records')
      expect(error.message).not.toContain('income')
    })
  })
})

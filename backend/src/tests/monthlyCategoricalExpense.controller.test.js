import { describe, expect, it, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'

// Mock all model dependencies before any imports
vi.mock('../models/monthlyCategoricalExpenses.model.js', () => ({
  MonthlyCategoricalExpense: {
    create: vi.fn(),
  },
}))

vi.mock('../models/dailyExpenses.model.js', () => ({
  DailyExpense: {
    updateMany: vi.fn(),
  },
}))

import {
  createMonthlyCategoricalExpense,
} from '../controllers/monthlyCategoricalExpense.controller.js'
import { MonthlyCategoricalExpense } from '../models/monthlyCategoricalExpenses.model.js'

describe('MonthlyCategoricalExpense Controller - parentId validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws 400 when parentId is missing', async () => {
    const req = {
      body: {
        description: 'Test Expense',
        month: '2026-01-01T00:00:00.000Z',
      },
      user: { _id: new mongoose.Types.ObjectId() },
    }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    const next = vi.fn()

    await createMonthlyCategoricalExpense(req, res, next)

    expect(next).toHaveBeenCalled()
    const error = next.mock.calls[0][0]
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Missing or invalid Parent ID')
  })

  it('throws 400 when parentId is an invalid ObjectId', async () => {
    const req = {
      body: {
        parentId: 'not-a-valid-id',
        description: 'Test Expense',
        month: '2026-01-01T00:00:00.000Z',
      },
      user: { _id: new mongoose.Types.ObjectId() },
    }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    const next = vi.fn()

    await createMonthlyCategoricalExpense(req, res, next)

    expect(next).toHaveBeenCalled()
    const error = next.mock.calls[0][0]
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Missing or invalid Parent ID')
  })

  it('does not throw for valid parentId', async () => {
    const validParentId = new mongoose.Types.ObjectId().toString()
    MonthlyCategoricalExpense.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      parentId: validParentId,
      description: 'Test Expense',
      projectedAmount: 0,
      actualAmount: 0,
      month: new Date('2026-01-01'),
    })

    const req = {
      body: {
        parentId: validParentId,
        description: 'Test Expense',
        month: '2026-01-01T00:00:00.000Z',
      },
      user: { _id: new mongoose.Types.ObjectId() },
    }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    const next = vi.fn()

    await createMonthlyCategoricalExpense(req, res, next)

    // Should not have called next with an error
    if (next.mock.calls.length > 0) {
      expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    }
    expect(res.status).toHaveBeenCalledWith(201)
  })
})

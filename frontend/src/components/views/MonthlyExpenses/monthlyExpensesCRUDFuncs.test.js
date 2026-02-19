import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchData,
  createMonthlyCategoricalExpenses,
  updateMonthlyCategoricalExpense,
  toggleSelectableFn,
  deleteMonthlyCategoricalExpense,
} from './monthlyExpensesCRUDFuncs'

describe('monthlyExpensesCRUDFuncs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchData', () => {
    it('fetches parent categories and expenses successfully', async () => {
      const mockParentData = {
        data: [{ _id: 'p1', description: 'Housing' }],
      }
      const mockExpenseData = {
        data: [
          {
            _id: 'm1',
            parentId: 'p1',
            description: 'Rent',
            projectedAmount: 1000,
          },
        ],
      }

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: vi.fn().mockReturnValue('application/json'),
          },
          json: vi.fn().mockResolvedValue({ success: true, ...mockParentData }),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: vi.fn().mockReturnValue('application/json'),
          },
          json: vi.fn().mockResolvedValue({ success: true, ...mockExpenseData }),
        })

      vi.stubGlobal('fetch', fetchMock)

      const setIsLoading = vi.fn()
      const setParentCategories = vi.fn()
      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const month = '2026-04'

      await fetchData(
        setIsLoading,
        month,
        setParentCategories,
        setMonthlyCatExpenses,
        setError,
      )

      expect(setIsLoading).toHaveBeenCalledWith(true)
      expect(setParentCategories).toHaveBeenCalledWith(mockParentData.data)
      expect(setMonthlyCatExpenses).toHaveBeenCalledWith(mockExpenseData.data)
      expect(setIsLoading).toHaveBeenCalledWith(false)
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles fetch errors and sets error message', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.stubGlobal('fetch', fetchMock)

      const setIsLoading = vi.fn()
      const setParentCategories = vi.fn()
      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const month = '2026-04'

      await fetchData(
        setIsLoading,
        month,
        setParentCategories,
        setMonthlyCatExpenses,
        setError,
      )

      expect(setIsLoading).toHaveBeenCalledWith(true)
      expect(setError).toHaveBeenCalledWith('Network error')
      expect(setIsLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('createMonthlyCategoricalExpenses', () => {
    it('creates a new expense and adds to list', async () => {
      const newExpense = {
        _id: 'm2',
        parentId: 'p1',
        description: 'Utilities',
        projectedAmount: 200,
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi
          .fn()
          .mockResolvedValue({ success: true, data: newExpense }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const body = {
        parentId: 'p1',
        description: 'Utilities',
        projectedAmount: 200,
      }

      await createMonthlyCategoricalExpenses(body, setMonthlyCatExpenses, setError)

      expect(setMonthlyCatExpenses).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles create errors and sets error message', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({
          success: false,
          message: 'Creation failed',
        })),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const body = {
        parentId: 'p1',
        description: 'Utilities',
        projectedAmount: 200,
      }

      await expect(
        createMonthlyCategoricalExpenses(body, setMonthlyCatExpenses, setError),
      ).rejects.toThrow()

      expect(setError).toHaveBeenCalledWith('Creation failed')
    })
  })

  describe('updateMonthlyCategoricalExpense', () => {
    it('updates an expense successfully', async () => {
      const updatedExpense = {
        _id: 'm1',
        parentId: 'p1',
        description: 'Rent',
        projectedAmount: 1100,
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi
          .fn()
          .mockResolvedValue({ success: true, data: updatedExpense }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const body = { projectedAmount: 1100 }

      await updateMonthlyCategoricalExpense('m1', body, setMonthlyCatExpenses, setError)

      expect(setMonthlyCatExpenses).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles update errors and sets error message', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({
          success: false,
          message: 'Update failed',
        })),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const body = { projectedAmount: 1100 }

      await expect(
        updateMonthlyCategoricalExpense('m1', body, setMonthlyCatExpenses, setError),
      ).rejects.toThrow()

      expect(setError).toHaveBeenCalledWith('Update failed')
    })
  })

  describe('toggleSelectableFn', () => {
    it('toggles selectable flag successfully', async () => {
      const updatedExpense = {
        _id: 'm1',
        parentId: 'p1',
        description: 'Rent',
        selectable: true,
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi
          .fn()
          .mockResolvedValue({ success: true, data: { record: updatedExpense } }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const body = { selectable: true }
      const month = '2026-04'

      await toggleSelectableFn('m1', body, month, setMonthlyCatExpenses, setError)

      expect(setMonthlyCatExpenses).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/monthly-categorical-expenses/m1/toggle-selectable/2026-04',
        expect.any(Object),
      )
    })

    it('handles toggle errors and sets error message', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({
          success: false,
          message: 'Toggle failed',
        })),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()
      const body = { selectable: true }
      const month = '2026-04'

      await expect(
        toggleSelectableFn('m1', body, month, setMonthlyCatExpenses, setError),
      ).rejects.toThrow()

      expect(setError).toHaveBeenCalledWith('Toggle failed')
    })
  })

  describe('deleteMonthlyCategoricalExpense', () => {
    it('deletes an expense successfully', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({ success: true }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()

      await deleteMonthlyCategoricalExpense('m1', setMonthlyCatExpenses, setError)

      expect(setMonthlyCatExpenses).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles delete errors and sets error message', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({
          success: false,
          message: 'Delete failed',
        })),
      })
      vi.stubGlobal('fetch', fetchMock)

      const setMonthlyCatExpenses = vi.fn()
      const setError = vi.fn()

      await expect(
        deleteMonthlyCategoricalExpense('m1', setMonthlyCatExpenses, setError),
      ).rejects.toThrow()

      expect(setError).toHaveBeenCalledWith('Delete failed')
    })
  })
})

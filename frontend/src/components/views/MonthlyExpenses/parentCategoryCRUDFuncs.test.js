import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createParentCategory,
  updateParentCategory,
  deleteParentCategory,
} from './parentCategoryCRUDFuncs'
import { apiFetch } from '@/utils/apiFetch'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

describe('parentCategoryCRUDFuncs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createParentCategory', () => {
    it('creates a parent category successfully', async () => {
      const mockCategory = {
        _id: 'p1',
        description: 'Housing',
        month: '2026-04-01T00:00:00.000Z',
      }

      apiFetch.mockResolvedValue({
        success: true,
        data: mockCategory,
      })

      const setParentCategories = vi.fn()
      const setError = vi.fn()
      const body = {
        description: 'Housing',
        month: '2026-04-01T00:00:00.000Z',
      }

      await createParentCategory(body, setParentCategories, setError)

      expect(apiFetch).toHaveBeenCalledWith('/api/v1/parent-categories/', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      expect(setParentCategories).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles create errors and sets error message', async () => {
      const errorMessage = 'Creation failed'
      apiFetch.mockRejectedValue(new Error(errorMessage))

      const setParentCategories = vi.fn()
      const setError = vi.fn()
      const body = {
        description: 'Housing',
        month: '2026-04-01T00:00:00.000Z',
      }

      await expect(
        createParentCategory(body, setParentCategories, setError),
      ).rejects.toThrow(errorMessage)

      expect(setError).toHaveBeenCalledWith(errorMessage)
      expect(setParentCategories).not.toHaveBeenCalled()
    })
  })

  describe('updateParentCategory', () => {
    it('updates a parent category successfully', async () => {
      const mockCategory = {
        _id: 'p1',
        description: 'Housing Updated',
      }

      apiFetch.mockResolvedValue({
        success: true,
        data: mockCategory,
      })

      const setParentCategories = vi.fn()
      const setError = vi.fn()
      const body = { description: 'Housing Updated' }

      await updateParentCategory('p1', body, setParentCategories, setError)

      expect(apiFetch).toHaveBeenCalledWith('/api/v1/parent-categories/p1', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      expect(setParentCategories).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles update errors and sets error message', async () => {
      const errorMessage = 'Update failed'
      apiFetch.mockRejectedValue(new Error(errorMessage))

      const setParentCategories = vi.fn()
      const setError = vi.fn()
      const body = { description: 'Housing Updated' }

      await expect(
        updateParentCategory('p1', body, setParentCategories, setError),
      ).rejects.toThrow(errorMessage)

      expect(setError).toHaveBeenCalledWith(errorMessage)
      expect(setParentCategories).not.toHaveBeenCalled()
    })
  })

  describe('deleteParentCategory', () => {
    it('deletes a parent category successfully', async () => {
      apiFetch.mockResolvedValue({
        success: true,
      })

      const setParentCategories = vi.fn()
      const setError = vi.fn()

      await deleteParentCategory('p1', setParentCategories, setError)

      expect(apiFetch).toHaveBeenCalledWith('/api/v1/parent-categories/p1', {
        method: 'DELETE',
      })
      expect(setParentCategories).toHaveBeenCalled()
      expect(setError).not.toHaveBeenCalled()
    })

    it('handles delete errors and sets error message', async () => {
      const errorMessage = 'Delete failed'
      apiFetch.mockRejectedValue(new Error(errorMessage))

      const setParentCategories = vi.fn()
      const setError = vi.fn()

      await expect(
        deleteParentCategory('p1', setParentCategories, setError),
      ).rejects.toThrow(errorMessage)

      expect(setError).toHaveBeenCalledWith(errorMessage)
      expect(setParentCategories).not.toHaveBeenCalled()
    })
  })
})

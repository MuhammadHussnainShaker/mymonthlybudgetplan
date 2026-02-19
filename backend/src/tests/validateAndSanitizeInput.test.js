import { describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import validateAndSanitizeInput from '../utils/validateAndSanitizeInput.js'
import { ApiError } from '../utils/ApiError.js'

describe('validateAndSanitizeInput', () => {
  describe('Required fields validation', () => {
    it('throws ApiError when required field is missing', () => {
      expect(() => {
        validateAndSanitizeInput({ selectable: true }, ['month'])
      }).toThrow(ApiError)
    })

    it('throws with correct message when required field is missing', () => {
      expect(() => {
        validateAndSanitizeInput({}, ['month'])
      }).toThrow('month is required')
    })

    it('throws when required field is null', () => {
      expect(() => {
        validateAndSanitizeInput({ month: null }, ['month'])
      }).toThrow('month is required')
    })

    it('throws when required field is undefined', () => {
      expect(() => {
        validateAndSanitizeInput({ month: undefined }, ['month'])
      }).toThrow('month is required')
    })

    it('does not throw when all required fields are present', () => {
      expect(() => {
        validateAndSanitizeInput(
          {
            month: '2026-01-01T00:00:00.000Z',
            selectable: true,
          },
          ['month', 'selectable'],
        )
      }).not.toThrow()
    })
  })

  describe('MongoDB ObjectId validation', () => {
    it('accepts valid MongoDB ObjectId', () => {
      const validId = new mongoose.Types.ObjectId().toString()
      const result = validateAndSanitizeInput(
        { monthlyCategoricalExpenseId: validId },
        [],
      )
      
      expect(result.monthlyCategoricalExpenseId).toBe(validId)
    })

    it('throws ApiError for invalid ObjectId format', () => {
      expect(() => {
        validateAndSanitizeInput(
          { monthlyCategoricalExpenseId: 'invalid-id' },
          [],
        )
      }).toThrow('Invalid monthly categorical expense ID format')
    })

    it('throws for empty string ObjectId', () => {
      expect(() => {
        validateAndSanitizeInput({ monthlyCategoricalExpenseId: '' }, [])
      }).toThrow('Invalid monthly categorical expense ID format')
    })

    it('skips validation when monthlyCategoricalExpenseId is not provided', () => {
      const result = validateAndSanitizeInput({}, [])
      
      expect(result.monthlyCategoricalExpenseId).toBeUndefined()
    })
  })

  describe('Boolean validation', () => {
    it('accepts true boolean value', () => {
      const result = validateAndSanitizeInput({ selectable: true }, [])
      
      expect(result.selectable).toBe(true)
    })

    it('accepts false boolean value', () => {
      const result = validateAndSanitizeInput({ selectable: false }, [])
      
      expect(result.selectable).toBe(false)
    })

    it('throws ApiError for non-boolean string', () => {
      expect(() => {
        validateAndSanitizeInput({ selectable: 'yes' }, [])
      }).toThrow('selectable must be a Boolean')
    })

    it('throws ApiError for number instead of boolean', () => {
      expect(() => {
        validateAndSanitizeInput({ selectable: 1 }, [])
      }).toThrow('selectable must be a Boolean')
    })

    it('throws ApiError for null instead of boolean', () => {
      expect(() => {
        validateAndSanitizeInput({ selectable: null }, ['selectable'])
      }).toThrow('selectable is required')
    })

    it('skips validation when selectable is not provided', () => {
      const result = validateAndSanitizeInput({}, [])
      
      expect(result.selectable).toBeUndefined()
    })
  })

  describe('Date ISO string validation', () => {
    it('accepts valid ISO date string', () => {
      const validDate = '2026-01-01T00:00:00.000Z'
      const result = validateAndSanitizeInput({ month: validDate }, [])
      
      expect(result.month).toBe(validDate)
    })

    it('throws ApiError for invalid date string', () => {
      expect(() => {
        validateAndSanitizeInput({ month: 'invalid-date' }, [])
      }).toThrow('Use ISO format (e.g., 2026-01-01T00:00:00.000Z)')
    })

    it('throws ApiError for non-ISO date format', () => {
      expect(() => {
        validateAndSanitizeInput({ month: '2026-01-01' }, [])
      }).toThrow('Use ISO format')
    })

    it('throws ApiError for date without timezone', () => {
      expect(() => {
        validateAndSanitizeInput({ month: '2026-01-01T00:00:00' }, [])
      }).toThrow('Use ISO format')
    })

    it('skips validation when month is not provided', () => {
      const result = validateAndSanitizeInput({}, [])
      
      expect(result.month).toBeUndefined()
    })
  })

  describe('Combined validations', () => {
    it('validates all fields together', () => {
      const validId = new mongoose.Types.ObjectId().toString()
      const validDate = '2026-01-01T00:00:00.000Z'
      
      const result = validateAndSanitizeInput(
        {
          monthlyCategoricalExpenseId: validId,
          selectable: true,
          month: validDate,
        },
        ['monthlyCategoricalExpenseId', 'selectable', 'month'],
      )
      
      expect(result.monthlyCategoricalExpenseId).toBe(validId)
      expect(result.selectable).toBe(true)
      expect(result.month).toBe(validDate)
    })

    it('returns only validated fields, not extra fields', () => {
      const result = validateAndSanitizeInput(
        {
          month: '2026-01-01T00:00:00.000Z',
          extraField: 'should not be included',
        },
        [],
      )
      
      expect(result.month).toBe('2026-01-01T00:00:00.000Z')
      expect(result.extraField).toBeUndefined()
    })

    it('handles empty input object', () => {
      const result = validateAndSanitizeInput({}, [])
      
      expect(result).toEqual({})
    })

    it('handles undefined input with no required fields', () => {
      const result = validateAndSanitizeInput(undefined, [])
      
      expect(result).toEqual({})
    })
  })

  describe('Error handling', () => {
    it('throws ApiError with statusCode 400', () => {
      try {
        validateAndSanitizeInput({ month: 'invalid' }, [])
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect(error.statusCode).toBe(400)
      }
    })

    it('includes helpful error message', () => {
      try {
        validateAndSanitizeInput({ selectable: 'not-boolean' }, [])
      } catch (error) {
        expect(error.message).toContain('selectable')
        expect(error.message).toContain('Boolean')
      }
    })
  })
})

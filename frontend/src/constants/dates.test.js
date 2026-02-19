import { describe, it, expect } from 'vitest'
import { DEFAULT_MONTH } from './dates'

describe('dates constants', () => {
  describe('DEFAULT_MONTH', () => {
    it('is defined and is a string', () => {
      expect(DEFAULT_MONTH).toBeDefined()
      expect(typeof DEFAULT_MONTH).toBe('string')
    })

    it('is a valid ISO 8601 date string', () => {
      const date = new Date(DEFAULT_MONTH)
      expect(date.toString()).not.toBe('Invalid Date')
      expect(date.toISOString()).toBe(DEFAULT_MONTH)
    })

    it('represents the first day of January 2026', () => {
      const date = new Date(DEFAULT_MONTH)
      expect(date.getUTCFullYear()).toBe(2026)
      expect(date.getUTCMonth()).toBe(0) // January is 0
      expect(date.getUTCDate()).toBe(1)
      expect(date.getUTCHours()).toBe(0)
      expect(date.getUTCMinutes()).toBe(0)
      expect(date.getUTCSeconds()).toBe(0)
      expect(date.getUTCMilliseconds()).toBe(0)
    })
  })
})

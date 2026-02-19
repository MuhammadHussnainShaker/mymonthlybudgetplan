import { describe, expect, it } from 'vitest'
import isoDateToYYYYMM from '@/utils/date-manipulators/isoDateToYYYYMM'
import yyyyMMToISODate from '@/utils/date-manipulators/yyyyMMToISODate'

describe('date manipulators', () => {
  it('formats ISO dates to YYYY-MM for month inputs', () => {
    expect(isoDateToYYYYMM('2026-02-01T00:00:00.000Z')).toBe('2026-02')
    expect(isoDateToYYYYMM('')).toBe('')
  })
})

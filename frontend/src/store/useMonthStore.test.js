import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('useMonthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  const loadStore = async () => (await import('@/store/useMonthStore')).default

  it('initializes month to the current month start in UTC', async () => {
    const useMonthStore = await loadStore()
    const now = new Date()
    const expected = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    ).toISOString()

    expect(useMonthStore.getState().month).toBe(expected)
  })

  it('setMonth converts YYYY-MM input to ISO start-of-month', async () => {
    const useMonthStore = await loadStore()

    useMonthStore.getState().setMonth('2026-03')
    expect(useMonthStore.getState().month).toBe('2026-03-01T00:00:00.000Z')
  })
})

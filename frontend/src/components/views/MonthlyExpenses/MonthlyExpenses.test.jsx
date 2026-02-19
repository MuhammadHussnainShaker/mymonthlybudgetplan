import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MonthlyExpenses from '@/components/views/MonthlyExpenses/MonthlyExpenses'
import useMonthStore from '@/store/useMonthStore'

describe('MonthlyExpenses', () => {
  const testMonth = '2026-04-01T00:00:00.000Z'

  beforeEach(() => {
    localStorage.clear()
    useMonthStore.setState({ month: testMonth })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders fetched categories, expenses, and totals', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: [{ _id: 'p1', description: 'Housing' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: [
            {
              _id: 'm1',
              parentId: 'p1',
              description: 'Rent',
              projectedAmount: 1000,
              actualAmount: 900,
              selectable: false,
            },
          ],
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<MonthlyExpenses />)

    expect(await screen.findByText('Monthly Expenses')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/parent-categories/${testMonth}`,
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/monthly-categorical-expenses/${testMonth}`,
      expect.any(Object),
    )
    expect(screen.getByDisplayValue('Housing')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Rent')).toBeInTheDocument()

    expect(screen.getAllByText('Projected: 1000')).toHaveLength(2)
    expect(screen.getAllByText('Actual: 900')).toHaveLength(2)
    expect(screen.getAllByText('Difference: 100')).toHaveLength(2)
  })

  it('shows empty state when no categories are available', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({ success: true, data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({ success: true, data: [] }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<MonthlyExpenses />)

    expect(await screen.findByText('No categories available.')).toBeInTheDocument()
  })
})

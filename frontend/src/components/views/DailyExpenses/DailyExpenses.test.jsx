import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import DailyExpenses from '@/components/views/DailyExpenses/DailyExpenses'

describe('DailyExpenses', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders fetched expenses and totals', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          dailyExpenses: [
            {
              _id: 'd1',
              description: 'Coffee',
              amount: 5,
              monthlyCategoricalExpenseId: 'c1',
            },
          ],
          selectableCategoricalExpenses: [{ _id: 'c1', description: 'Food' }],
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<DailyExpenses />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    expect(await screen.findByDisplayValue('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument()
  }, 20000)

  it('creates a new daily expense via the input', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { dailyExpenses: [], selectableCategoricalExpenses: [] },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { _id: 'd2', description: 'Taxi', amount: 12 },
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<DailyExpenses />)

    await screen.findByText('Daily Expenses')

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Taxi' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/daily-expense',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        }),
      ),
    )

    expect(await screen.findByDisplayValue('Taxi')).toBeInTheDocument()
  })
})

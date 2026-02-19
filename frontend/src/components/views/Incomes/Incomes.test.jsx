import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Incomes from '@/components/views/Incomes/Incomes'
import useMonthStore from '@/store/useMonthStore'

describe('Incomes', () => {
  const testMonth = '2026-04-01T00:00:00.000Z'

  beforeEach(() => {
    localStorage.clear()
    useMonthStore.setState({ month: testMonth })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders fetched incomes and totals', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'i1',
            description: 'Salary',
            projectedAmount: 1000,
            actualAmount: 900,
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<Incomes />)

    expect(await screen.findByDisplayValue('Salary')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/incomes/${testMonth}`,
      expect.any(Object),
    )
    expect(screen.getByText('Total')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('900')).toBeInTheDocument()
      expect(screen.getByText('-100')).toBeInTheDocument()
    })
  })

  it('creates, updates, and deletes income records', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: [
            {
              _id: 'i1',
              description: 'Salary',
              projectedAmount: 1000,
              actualAmount: 900,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            _id: 'i2',
            description: 'Bonus',
            projectedAmount: 0,
            actualAmount: 0,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            _id: 'i2',
            description: 'Bonus Updated',
            projectedAmount: 0,
            actualAmount: 0,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { _id: 'i2' },
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<Incomes />)

    const salaryInput = await screen.findByDisplayValue('Salary')

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Bonus' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() =>
      expect(screen.getByLabelText(/new item description/i)).toHaveValue(''),
    )

    await waitFor(() =>
      expect(document.querySelector('#description-i2')).not.toBeNull(),
    )

    const bonusInput = document.querySelector('#description-i2')

    fireEvent.change(bonusInput, { target: { value: 'Bonus Updated' } })
    fireEvent.blur(bonusInput)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/incomes/i2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ description: 'Bonus Updated' }),
        }),
      ),
    )

    fireEvent.change(salaryInput, { target: { value: ' ' } })
    fireEvent.blur(salaryInput)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/incomes/i1',
        expect.objectContaining({ method: 'DELETE' }),
      ),
    )

    await waitFor(() => expect(salaryInput).not.toBeInTheDocument())
  })
})

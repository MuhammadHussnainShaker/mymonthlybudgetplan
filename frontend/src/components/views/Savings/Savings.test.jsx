import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Savings from '@/components/views/Savings/Savings'
import useMonthStore from '@/store/useMonthStore'

describe('Savings', () => {
  const testMonth = '2026-04-01T00:00:00.000Z'

  beforeEach(() => {
    localStorage.clear()
    useMonthStore.setState({ month: testMonth })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders fetched savings and totals', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            _id: 's1',
            description: 'Emergency Fund',
            projectedAmount: 300,
            actualAmount: 250,
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<Savings />)

    expect(await screen.findByDisplayValue('Emergency Fund')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/savings/${testMonth}`,
      expect.any(Object),
    )
    expect(screen.getByText('Total')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('300')).toBeInTheDocument()
      expect(screen.getByText('250')).toBeInTheDocument()
      expect(screen.getByText('-50')).toBeInTheDocument()
    })
  })

  it('creates, updates, and deletes saving records', async () => {
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
              _id: 's1',
              description: 'Emergency Fund',
              projectedAmount: 300,
              actualAmount: 250,
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
            _id: 's2',
            description: 'Vacation',
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
            _id: 's2',
            description: 'Vacation Updated',
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
          data: { _id: 's2' },
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<Savings />)

    const emergencyInput = await screen.findByDisplayValue('Emergency Fund')

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Vacation' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() =>
      expect(screen.getByLabelText(/new item description/i)).toHaveValue(''),
    )

    await waitFor(() =>
      expect(document.querySelector('#description-s2')).not.toBeNull(),
    )

    const vacationInput = document.querySelector('#description-s2')

    fireEvent.change(vacationInput, { target: { value: 'Vacation Updated' } })
    fireEvent.blur(vacationInput)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/savings/s2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ description: 'Vacation Updated' }),
        }),
      ),
    )

    fireEvent.change(emergencyInput, { target: { value: ' ' } })
    fireEvent.blur(emergencyInput)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/savings/s1',
        expect.objectContaining({ method: 'DELETE' }),
      ),
    )

    await waitFor(() => expect(emergencyInput).not.toBeInTheDocument())
  })
})

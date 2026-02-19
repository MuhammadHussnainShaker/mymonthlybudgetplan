import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CreateExpenseItem from '@/components/views/DailyExpenses/CreateExpenseItem'

describe('CreateExpenseItem', () => {
  beforeEach(() => {
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits description on blur and clears the input', async () => {
    const createRecordFn = vi.fn().mockResolvedValue()
    render(
      <CreateExpenseItem createRecordFn={createRecordFn} date='2026-02-01' />,
    )

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Taxi' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() =>
      expect(createRecordFn).toHaveBeenCalledWith({
        description: 'Taxi',
        date: new Date('2026-02-01').toISOString(),
      }),
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/new item description/i)).toHaveValue(''),
    )
  })

  it('clears the input on escape without submitting', () => {
    const createRecordFn = vi.fn().mockResolvedValue()
    render(<CreateExpenseItem createRecordFn={createRecordFn} />)

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Coffee' },
    })
    fireEvent.keyDown(screen.getByLabelText(/new item description/i), {
      key: 'Escape',
    })

    expect(screen.getByLabelText(/new item description/i)).toHaveValue('')
    expect(createRecordFn).not.toHaveBeenCalled()
  })

  it('alerts on create failure and keeps description', async () => {
    const createRecordFn = vi.fn().mockRejectedValue(new Error('fail'))
    render(<CreateExpenseItem createRecordFn={createRecordFn} />)

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Groceries' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() => expect(alert).toHaveBeenCalled())
    expect(screen.getByLabelText(/new item description/i)).toHaveValue(
      'Groceries',
    )
  })
})

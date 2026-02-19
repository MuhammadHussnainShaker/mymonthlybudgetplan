import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ExpenseItem from '@/components/views/DailyExpenses/ExpenseItem'

describe('ExpenseItem', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn())
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('updates fields and sends changed values on blur', async () => {
    const updateRecordFn = vi.fn().mockResolvedValue()
    render(
      <ExpenseItem
        id='e1'
        description='Coffee'
        amount={5}
        categoryId='c1'
        selectableCategories={[
          { _id: 'c1', description: 'Food' },
          { _id: 'c2', description: 'Transport' },
        ]}
        updateRecordFn={updateRecordFn}
      />,
    )

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Coffee Latte' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'c2' },
    })
    fireEvent.blur(screen.getByLabelText(/category/i))

    await waitFor(() =>
      expect(updateRecordFn).toHaveBeenCalledWith('e1', {
        description: 'Coffee Latte',
        amount: 6,
        monthlyCategoricalExpenseId: 'c2',
      }),
    )
  })

  it('confirms and deletes when description is emptied', async () => {
    const deleteRecordFn = vi.fn().mockResolvedValue()
    const confirmMock = vi.mocked(confirm).mockReturnValue(true)

    render(
      <ExpenseItem
        id='e2'
        description='Snacks'
        amount={4}
        deleteRecordFn={deleteRecordFn}
      />,
    )

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: ' ' },
    })
    fireEvent.blur(screen.getByLabelText(/description/i))

    await waitFor(() => expect(confirmMock).toHaveBeenCalled())
    await waitFor(() => expect(deleteRecordFn).toHaveBeenCalledWith('e2'))
  })

  it('resets fields on escape', () => {
    render(
      <ExpenseItem
        id='e3'
        description='Lunch'
        amount={8}
        categoryId='c1'
        selectableCategories={[{ _id: 'c1', description: 'Food' }]}
      />,
    )

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Dinner' },
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '12' },
    })
    fireEvent.keyDown(screen.getByLabelText(/description/i), { key: 'Escape' })

    expect(screen.getByLabelText(/description/i)).toHaveValue('Lunch')
    expect(screen.getByLabelText(/amount/i)).toHaveValue(8)
    expect(screen.getByLabelText(/category/i)).toHaveValue('c1')
  })
})

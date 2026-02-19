import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MonthlyExpenseItemsDataHeader from './MonthlyExpenseItemsDataHeader'
import * as parentCategoryCRUDFuncs from './parentCategoryCRUDFuncs'

vi.mock('./parentCategoryCRUDFuncs', () => ({
  updateParentCategory: vi.fn(),
  deleteParentCategory: vi.fn(),
}))

describe('MonthlyExpenseItemsDataHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('alert', vi.fn())
    vi.stubGlobal('confirm', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the header with input field and labels', () => {
    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={vi.fn()}
        setError={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Housing')).toBeInTheDocument()
    expect(screen.getByText('Projected')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()
    expect(screen.getByText('Difference')).toBeInTheDocument()
  })

  it('updates description on blur when changed', async () => {
    parentCategoryCRUDFuncs.updateParentCategory.mockResolvedValue()

    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.change(input, { target: { value: 'Housing Updated' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(parentCategoryCRUDFuncs.updateParentCategory).toHaveBeenCalledWith(
        'p1',
        { description: 'Housing Updated' },
        setRecordFn,
        setError,
      ),
    )
  })

  it('does not update when description is unchanged', async () => {
    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.blur(input)

    await waitFor(() => {
      expect(parentCategoryCRUDFuncs.updateParentCategory).not.toHaveBeenCalled()
    })
  })

  it('prompts to delete when description is empty and user confirms', async () => {
    window.confirm.mockReturnValue(true)
    parentCategoryCRUDFuncs.deleteParentCategory.mockResolvedValue()

    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
      expect(parentCategoryCRUDFuncs.deleteParentCategory).toHaveBeenCalledWith(
        'p1',
        setRecordFn,
        setError,
      )
    })
  })

  it('does not delete when description is empty and user cancels', async () => {
    window.confirm.mockReturnValue(false)

    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
      expect(parentCategoryCRUDFuncs.deleteParentCategory).not.toHaveBeenCalled()
    })
  })

  it('reverts to initial description on update failure', async () => {
    parentCategoryCRUDFuncs.updateParentCategory.mockRejectedValue(
      new Error('Update failed'),
    )
    window.alert.mockImplementation(() => {})

    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.change(input, { target: { value: 'Housing Updated' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to update. Reverting changes.',
      )
      expect(input).toHaveValue('Housing')
    })
  })

  it('reverts to initial description on delete failure', async () => {
    window.confirm.mockReturnValue(true)
    parentCategoryCRUDFuncs.deleteParentCategory.mockRejectedValue(
      new Error('Delete failed'),
    )
    window.alert.mockImplementation(() => {})

    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to delete. Reverting changes.',
      )
      expect(input).toHaveValue('Housing')
    })
  })

  it('resets input value on Escape key press', () => {
    render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={vi.fn()}
        setError={vi.fn()}
      />,
    )

    const input = screen.getByLabelText(/description/i)
    fireEvent.change(input, { target: { value: 'Housing Updated' } })
    expect(input).toHaveValue('Housing Updated')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveValue('Housing')
  })

  it('updates when initialDescription changes', () => {
    const { rerender } = render(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Housing'
        setRecordFn={vi.fn()}
        setError={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/description/i)).toHaveValue('Housing')

    rerender(
      <MonthlyExpenseItemsDataHeader
        id='p1'
        description='Transport'
        setRecordFn={vi.fn()}
        setError={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/description/i)).toHaveValue('Transport')
  })
})

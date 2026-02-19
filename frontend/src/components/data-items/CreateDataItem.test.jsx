import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CreateDataItem from '@/components/data-items/CreateDataItem'
import useMonthStore from '@/store/useMonthStore'

describe('CreateDataItem', () => {
  const testMonth = '2026-04-01T00:00:00.000Z'

  beforeEach(() => {
    vi.stubGlobal('alert', vi.fn())
    useMonthStore.setState({ month: testMonth })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a record on blur and clears the input', async () => {
    const createRecordFn = vi.fn().mockResolvedValue()
    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <CreateDataItem
        createRecordFn={createRecordFn}
        parentId='p1'
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Internet' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() =>
      expect(createRecordFn).toHaveBeenCalledWith(
        {
          description: 'Internet',
          month: testMonth,
          parentId: 'p1',
        },
        setRecordFn,
        setError,
      ),
    )
    expect(screen.getByLabelText(/new item description/i)).toHaveValue('')
  })

  it('creates a record without parentId when not provided', async () => {
    const createRecordFn = vi.fn().mockResolvedValue()
    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <CreateDataItem
        createRecordFn={createRecordFn}
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Internet' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() =>
      expect(createRecordFn).toHaveBeenCalledWith(
        {
          description: 'Internet',
          month: testMonth,
        },
        setRecordFn,
        setError,
      ),
    )
    expect(screen.getByLabelText(/new item description/i)).toHaveValue('')
  })

  it('alerts on create error and preserves text', async () => {
    const createRecordFn = vi.fn().mockRejectedValue(new Error('fail'))
    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <CreateDataItem
        createRecordFn={createRecordFn}
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    fireEvent.change(screen.getByLabelText(/new item description/i), {
      target: { value: 'Groceries' },
    })
    fireEvent.blur(screen.getByLabelText(/new item description/i))

    await waitFor(() => expect(alert).toHaveBeenCalled())
    expect(screen.getByLabelText(/new item description/i)).toHaveValue(
      'Groceries',
    )
  })

  it('uses custom placeholder when provided', () => {
    render(<CreateDataItem placeholder='Add new category...' />)

    const input = screen.getByLabelText(/new item description/i)
    expect(input).toHaveAttribute('placeholder', 'Add new category...')
  })

  it('uses default placeholder when not provided', () => {
    render(<CreateDataItem />)

    const input = screen.getByLabelText(/new item description/i)
    expect(input).toHaveAttribute('placeholder', 'New item...')
  })
})

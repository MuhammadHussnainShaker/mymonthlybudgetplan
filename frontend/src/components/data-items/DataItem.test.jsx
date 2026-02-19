import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import DataItem from '@/components/data-items/DataItem'

describe('DataItem', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn())
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls updateRecordFn on blur with changed fields', async () => {
    const updateRecordFn = vi.fn().mockResolvedValue()
    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <DataItem
        id='1'
        description='Rent'
        projAmount={1000}
        actualAmount={900}
        updateRecordFn={updateRecordFn}
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Rent updated' },
    })
    fireEvent.blur(screen.getByLabelText(/description/i))

    await waitFor(() =>
      expect(updateRecordFn).toHaveBeenCalledWith(
        '1',
        { description: 'Rent updated' },
        setRecordFn,
        setError,
      ),
    )
  })

  it('confirms deletion when description emptied', async () => {
    const deleteRecordFn = vi.fn().mockResolvedValue()
    const setRecordFn = vi.fn()
    const setError = vi.fn()
    const confirmMock = vi.mocked(confirm).mockReturnValue(true)

    render(
      <DataItem
        id='1'
        description='Rent'
        projAmount={1000}
        actualAmount={900}
        deleteRecordFn={deleteRecordFn}
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: ' ' },
    })
    fireEvent.blur(screen.getByLabelText(/description/i))

    await waitFor(() => expect(confirmMock).toHaveBeenCalled())
    await waitFor(() =>
      expect(deleteRecordFn).toHaveBeenCalledWith('1', setRecordFn, setError),
    )
  })

  it('reverts values on update error', async () => {
    const updateRecordFn = vi.fn().mockRejectedValue(new Error('fail'))
    const setRecordFn = vi.fn()
    const setError = vi.fn()

    render(
      <DataItem
        id='1'
        description='Rent'
        projAmount={1000}
        actualAmount={900}
        updateRecordFn={updateRecordFn}
        setRecordFn={setRecordFn}
        setError={setError}
      />,
    )

    fireEvent.change(screen.getByLabelText(/projected amount/i), {
      target: { value: '1100' },
    })
    fireEvent.blur(screen.getByLabelText(/projected amount/i))

    await waitFor(() => expect(alert).toHaveBeenCalled())
    expect(screen.getByLabelText(/projected amount/i)).toHaveValue(1000)
  })
})

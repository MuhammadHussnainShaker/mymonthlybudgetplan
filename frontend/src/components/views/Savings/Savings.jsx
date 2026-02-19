import { useEffect, useState } from 'react'
import { DataHeader, DataItem, CreateDataItem } from '@/components'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { apiFetch } from '@/utils/apiFetch'
import { calculateProjectedActualTotals } from '@/utils/calculations'
import {
  addItemToList,
  removeItemFromList,
  updateItemInList,
} from '@/utils/listStateUpdaters'
import useMonthStore from '@/store/useMonthStore'

export default function Savings() {
  const [savings, setSavings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const totals = calculateProjectedActualTotals(savings)
  const month = useMonthStore((state) => state.month)

  useEffect(() => {
    async function fetchSavings() {
      try {
        const data = await apiFetch(`/api/v1/savings/${month}`, {
          method: 'GET',
        })
        setSavings(data.data)
      } catch (error) {
        console.error('Error occurred while fetching savings', error)
        setError(error?.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavings()
  }, [month])

  async function createSaving(body) {
    try {
      const data = await apiFetch('/api/v1/savings', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setSavings((prev) => addItemToList(prev, data.data))
    } catch (error) {
      console.error('Error occurred while creating saving record:', error)
      setError(error?.message)
      throw error
    }
  }

  async function updateSaving(id, body) {
    try {
      const data = await apiFetch(`/api/v1/savings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setSavings((prev) => updateItemInList(prev, data.data))
    } catch (error) {
      console.error('Error occurred while updating saving record:', error)
      setError(error?.message)
      throw error
    }
  }

  async function deleteSaving(id) {
    try {
      await apiFetch(`/api/v1/savings/${id}`, { method: 'DELETE' })
      setSavings((prev) => removeItemFromList(prev, id))
    } catch (error) {
      console.error('Error occurred while deleting saving record:', error)
      setError(error?.message)
      throw error
    }
  }

  if (isLoading) return <h1>Loading...</h1>

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Savings</h2>
      </div>

      <ErrorMessage message={error} />

      <div className='space-y-2 overflow-x-auto'>
        <DataHeader sectionName='Savings' />

        <div className='space-y-2'>
          {savings.length > 0 &&
            savings.map((saving, index) => (
              <DataItem
                id={saving._id}
                key={saving._id}
                index={index}
                description={saving.description}
                projAmount={saving.projectedAmount}
                actualAmount={saving.actualAmount}
                projMinusActual={false}
                updateRecordFn={updateSaving}
                deleteRecordFn={deleteSaving}
              />
            ))}
        </div>

        <CreateDataItem createRecordFn={createSaving} />
      </div>

      <div className='overflow-x-auto'>
        <div className='min-w-[720px] grid grid-cols-[3rem_1fr_8rem_8rem_8rem] gap-2 px-2 py-2 border border-slate-700/50 rounded'>
          <div />
          <div className='font-medium'>Total</div>
          <div className='text-right'>{totals.projectedTotal}</div>
          <div className='text-right'>{totals.actualTotal}</div>
          <div className='text-right'>{totals.difference}</div>
        </div>
      </div>
    </section>
  )
}

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

export default function Incomes() {
  const [incomes, setIncomes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const totals = calculateProjectedActualTotals(incomes)
  const month = useMonthStore((state) => state.month)

  useEffect(() => {
    async function fetchIncomes() {
      try {
        const data = await apiFetch(`/api/v1/incomes/${month}`, {
          method: 'GET',
        })
        setIncomes(data.data)
      } catch (error) {
        console.error('Error occurred while fetching incomes', error)
        setError(error?.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIncomes()
  }, [month])

  async function createIncome(body) {
    try {
      const data = await apiFetch('/api/v1/incomes', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setIncomes((prev) => addItemToList(prev, data.data))
    } catch (error) {
      console.error('Error occurred while creating income record:', error)
      setError(error?.message)
      throw error
    }
  }

  async function updateIncome(id, body) {
    try {
      const data = await apiFetch(`/api/v1/incomes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setIncomes((prev) => updateItemInList(prev, data.data))
    } catch (error) {
      console.error('Error occurred while updating income record:', error)
      setError(error?.message)
      throw error
    }
  }

  async function deleteIncome(id) {
    try {
      await apiFetch(`/api/v1/incomes/${id}`, { method: 'DELETE' })
      setIncomes((prev) => removeItemFromList(prev, id))
    } catch (error) {
      console.error('Error occurred while deleting income record:', error)
      setError(error?.message)
      throw error
    }
  }

  if (isLoading) return <h1>Loading...</h1>

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Incomes</h2>
      </div>

      <ErrorMessage message={error} />

      <div className='space-y-2 overflow-x-auto'>
        <DataHeader sectionName='Income' />

        <div className='space-y-2'>
          {incomes.length > 0 &&
            incomes.map((income, index) => (
              <DataItem
                id={income._id}
                key={income._id}
                index={index}
                description={income.description}
                projAmount={income.projectedAmount}
                actualAmount={income.actualAmount}
                projMinusActual={false}
                updateRecordFn={updateIncome}
                deleteRecordFn={deleteIncome}
              />
            ))}
        </div>

        <CreateDataItem createRecordFn={createIncome} />
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

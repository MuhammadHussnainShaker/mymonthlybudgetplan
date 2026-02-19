import { useEffect, useState } from 'react'
import ExpenseItem from '@/components/views/DailyExpenses/ExpenseItem'
import CreateExpenseItem from '@/components/views/DailyExpenses/CreateExpenseItem'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { apiFetch } from '@/utils/apiFetch'
import { sumBy } from '@/utils/calculations'
import {
  addItemToList,
  removeItemFromList,
  updateItemInList,
} from '@/utils/listStateUpdaters'

export default function DailyExpenses() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyExpenses, setDailyExpenses] = useState([])
  const totals = { totalAmount: sumBy(dailyExpenses, 'amount') }
  const [selectableCategories, setSelectableCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDailyExpenses() {
      setIsLoading(true)
      try {
        const data = await apiFetch(`/api/v1/daily-expense?date=${date}`, {
          method: 'GET',
        })
        setDailyExpenses(data.data.dailyExpenses)
        setSelectableCategories(data.data.selectableCategoricalExpenses)
      } catch (error) {
        console.error('Error occurred while fetching daily-expenses', error)
        setError(error?.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyExpenses()
  }, [date])

  async function createDailyExpense(body) {
    try {
      const data = await apiFetch('/api/v1/daily-expense', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setDailyExpenses((prev) => addItemToList(prev, data.data))
    } catch (error) {
      console.error('Error occurred while creating daily-expense record', error)
      setError(error?.message)
      throw error
    }
  }

  async function updateDailyExpense(id, body) {
    try {
      const data = await apiFetch(`/api/v1/daily-expense/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setDailyExpenses((prev) => updateItemInList(prev, data.data))
    } catch (error) {
      console.error('Error occurred while updating daily-expense record:', error)
      setError(error?.message)
      throw error
    }
  }

  async function deleteDailyExpense(id) {
    try {
      await apiFetch(`/api/v1/daily-expense/${id}`, { method: 'DELETE' })
      setDailyExpenses((prev) => removeItemFromList(prev, id))
    } catch (error) {
      console.error('Error occurred while deleting daily-expense record:', error)
      setError(error?.message)
      throw error
    }
  }

  if (isLoading) return <h1>Loading...</h1>

  return (
    <section className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-lg font-medium'>Daily Expenses</h2>

        <div className='flex items-center gap-2'>
          <label className='text-sm' htmlFor='daily-expense-date'>
            Date
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='date'
            name='daily-expense-date'
            id='daily-expense-date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className='space-y-2 overflow-x-auto'>
        <div className='min-w-[720px] grid grid-cols-[3rem_1fr_8rem_1fr] gap-2 px-2 py-2 text-sm font-medium border border-slate-700/50 rounded'>
          <div>#</div>
          <div>Description</div>
          <div className='text-right'>Amount</div>
          <div>Category</div>
        </div>

        <div className='space-y-2'>
          {dailyExpenses.length > 0 &&
            dailyExpenses.map((expense, index) => (
              <ExpenseItem
                key={expense._id}
                id={expense._id}
                index={index}
                description={expense.description}
                amount={expense.amount}
                updateRecordFn={updateDailyExpense}
                deleteRecordFn={deleteDailyExpense}
                selectableCategories={selectableCategories}
                categoryId={expense.monthlyCategoricalExpenseId}
              />
            ))}
        </div>

        <CreateExpenseItem createRecordFn={createDailyExpense} date={date} />
      </div>

      <div className='overflow-x-auto'>
        <div className='min-w-[720px] grid grid-cols-2 gap-2 px-2 py-2 border border-slate-700/50 rounded'>
          <div className='font-medium'>Total</div>
          <div className='text-right'>{totals.totalAmount}</div>
        </div>
      </div>
    </section>
  )
}

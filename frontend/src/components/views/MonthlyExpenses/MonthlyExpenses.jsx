import { useEffect, useState } from 'react'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { calculateParentTotals } from '@/utils/calculations'
import {
  createMonthlyCategoricalExpenses,
  deleteMonthlyCategoricalExpense,
  fetchData,
  toggleSelectableFn,
  updateMonthlyCategoricalExpense,
} from './monthlyExpensesCRUDFuncs'
import useMonthStore from '@/store/useMonthStore'
import RenderMonthlyExpenseItems from './RenderMonthlyExpenseItems'
import { CreateDataItem } from '@/components/data-items'
import { createParentCategory } from './parentCategoryCRUDFuncs'

export default function MonthlyExpenses() {
  const [parentCategories, setParentCategories] = useState([])
  const [monthlyCatExpenses, setMonthlyCatExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const month = useMonthStore((state) => state.month)
  const totals = calculateParentTotals(monthlyCatExpenses)

  useEffect(() => {
    fetchData(
      setIsLoading,
      month,
      setParentCategories,
      setMonthlyCatExpenses,
      setError,
    )
  }, [month])

  const renderMonthlyExpenseItemProps = {
    parentCategories,
    setParentCategories,
    monthlyCatExpenses,
    setMonthlyCatExpenses,
    setError,
    totals,
    toggleSelectableFn,
    deleteMonthlyCategoricalExpense,
    updateMonthlyCategoricalExpense,
    createMonthlyCategoricalExpenses,
  }

  if (isLoading) return <h1>Loading...</h1>

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Monthly Expenses</h2>
      </div>

      <ErrorMessage message={error} />

      <RenderMonthlyExpenseItems {...renderMonthlyExpenseItemProps} />

      <CreateDataItem
        placeholder='Add new parent category'
        createRecordFn={createParentCategory}
        setRecordFn={setParentCategories}
        setError={setError}
      />

      {parentCategories.length > 0 && (
        <div className='overflow-x-auto'>
          <div className='min-w-[720px] grid grid-cols-4 gap-2 px-2 py-2 border border-slate-700/50 rounded'>
            <div className='font-medium'>Grand Total</div>
            <div className='text-right'>
              Projected: {totals.grand.projectedTotal}
            </div>
            <div className='text-right'>Actual: {totals.grand.actualTotal}</div>
            <div className='text-right'>
              Difference: {totals.grand.difference}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

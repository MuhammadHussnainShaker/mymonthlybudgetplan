import { CreateDataItem, DataItem } from '@/components/data-items'
import MonthlyExpenseItemsDataHeader from './MonthlyExpenseItemsDataHeader'

export default function RenderMonthlyExpenseItems({
  parentCategories,
  setParentCategories = async () => {},
  monthlyCatExpenses,
  setMonthlyCatExpenses = async () => {},
  setError = async () => {},
  totals,
  toggleSelectableFn,
  deleteMonthlyCategoricalExpense,
  updateMonthlyCategoricalExpense,
  createMonthlyCategoricalExpenses,
}) {
  return (
    <>
      {parentCategories.length === 0 && <p>No categories available.</p>}

      {parentCategories.length > 0 &&
        parentCategories.map((parentCategory) => {
          const relevantExpenses = monthlyCatExpenses.filter(
            (expense) =>
              String(expense.parentId) === String(parentCategory._id),
          )

          const parentTotals = totals.byParent[String(parentCategory._id)] ?? {
            projectedTotal: 0,
            actualTotal: 0,
            difference: 0,
          }

          return (
            <div key={parentCategory._id} className='space-y-2'>

              <div className='space-y-2 overflow-x-auto'>
                <MonthlyExpenseItemsDataHeader
                  id={parentCategory._id}
                  description={parentCategory.description}
                  setRecordFn={setParentCategories}
                  setError={setError}
                />

                {relevantExpenses.length === 0 && (
                  <p className='text-sm opacity-80'>
                    No expenses recorded for this category.
                  </p>
                )}

                {relevantExpenses.length > 0 &&
                  relevantExpenses.map((expense, index) => (
                    <DataItem
                      key={expense._id}
                      id={expense._id}
                      index={index}
                      description={expense.description}
                      projAmount={expense.projectedAmount}
                      actualAmount={expense.actualAmount}
                      projMinusActual={true}
                      isActualDisabled={expense.selectable}
                      showSelectable={true}
                      initialSelectable={expense.selectable}
                      toggleSelectableFn={toggleSelectableFn}
                      deleteRecordFn={deleteMonthlyCategoricalExpense}
                      updateRecordFn={updateMonthlyCategoricalExpense}
                      setRecordFn={setMonthlyCatExpenses}
                      setError={setError}
                    />
                  ))}

                <CreateDataItem
                  createRecordFn={createMonthlyCategoricalExpenses}
                  parentId={parentCategory._id}
                  setRecordFn={setMonthlyCatExpenses}
                  setError={setError}
                />
              </div>

              <div className='overflow-x-auto'>
                <div className='min-w-[720px] grid grid-cols-4 gap-2 px-2 py-2 border border-slate-700/50 rounded'>
                  <div className='font-medium'>Total</div>
                  <div className='text-right'>
                    Projected: {parentTotals.projectedTotal}
                  </div>
                  <div className='text-right'>
                    Actual: {parentTotals.actualTotal}
                  </div>
                  <div className='text-right'>
                    Difference: {parentTotals.difference}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
    </>
  )
}

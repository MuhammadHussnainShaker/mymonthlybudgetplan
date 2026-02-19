import { apiFetch } from '@/utils/apiFetch'
import { addItemToList, removeItemFromList, updateItemInList } from '@/utils/listStateUpdaters'

export async function fetchData(
  setIsLoading,
  month,
  setParentCategories,
  setMonthlyCatExpenses,
  setError,
) {
  setIsLoading(true)
  try {
    const [parentData, expenseData] = await Promise.all([
      apiFetch(`/api/v1/parent-categories/${month}`, {
        method: 'GET',
      }),
      apiFetch(`/api/v1/monthly-categorical-expenses/${month}`, {
        method: 'GET',
      }),
    ])

    setParentCategories(parentData.data)
    setMonthlyCatExpenses(expenseData.data)
  } catch (error) {
    console.error('Error occurred while fetching monthly expense data', error)
    setError(error?.message)
  } finally {
    setIsLoading(false)
  }
}

export async function createMonthlyCategoricalExpenses(
  body,
  setMonthlyCatExpenses,
  setError,
) {
  try {
    const data = await apiFetch('/api/v1/monthly-categorical-expenses/', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    setMonthlyCatExpenses((prev) => addItemToList(prev, data.data))
  } catch (error) {
    console.error(
      'Error occurred while creating monthly-categorical-expense record',
      error,
    )
    setError(error?.message)
    throw error
  }
}

export async function updateMonthlyCategoricalExpense(
  id,
  body,
  setMonthlyCatExpenses,
  setError,
) {
  try {
    const data = await apiFetch(`/api/v1/monthly-categorical-expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    setMonthlyCatExpenses((prev) => updateItemInList(prev, data.data))
  } catch (error) {
    console.error(
      'Error occurred while updating monthly-categorical-expense record:',
      error,
    )
    setError(error?.message)
    throw error
  }
}

export async function toggleSelectableFn(
  id,
  body,
  month,
  setMonthlyCatExpenses,
  setError,
) {
  try {
    const data = await apiFetch(
      `/api/v1/monthly-categorical-expenses/${id}/toggle-selectable/${month}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    )

    setMonthlyCatExpenses((prev) => updateItemInList(prev, data.data.record))
  } catch (error) {
    console.error(
      'Error occurred while toggling monthly-categorical-expense record selectable:',
      error,
    )
    setError(error?.message)
    throw error
  }
}

export async function deleteMonthlyCategoricalExpense(
  id,
  setMonthlyCatExpenses,
  setError,
) {
  try {
    await apiFetch(`/api/v1/monthly-categorical-expenses/${id}`, {
      method: 'DELETE',
    })
    setMonthlyCatExpenses((prev) => removeItemFromList(prev, id))
  } catch (error) {
    console.error(
      'Error occurred while deleting monthly-categorical-expenses record:',
      error,
    )
    setError(error?.message)
    throw error
  }
}

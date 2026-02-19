import { apiFetch } from '@/utils/apiFetch'
import { addItemToList, removeItemFromList, updateItemInList } from '@/utils/listStateUpdaters'

export async function createParentCategory(
  body,
  setParentCategories,
  setError,
) {
  try {
    const data = await apiFetch('/api/v1/parent-categories/', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    setParentCategories((prev) => addItemToList(prev, data.data))
  } catch (error) {
    console.error('Error occurred while creating parent-category record', error)
    setError(error?.message)
    throw error
  }
}

export async function updateParentCategory(
  id,
  body,
  setParentCategories,
  setError,
) {
  try {
    const data = await apiFetch(`/api/v1/parent-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    setParentCategories((prev) => updateItemInList(prev, data.data))
  } catch (error) {
    console.error(
      'Error occurred while updating parent-category record:',
      error,
    )
    setError(error?.message)
    throw error
  }
}

export async function deleteParentCategory(
  id,
  setParentCategories,
  setError,
) {
  try {
    await apiFetch(`/api/v1/parent-categories/${id}`, {
      method: 'DELETE',
    })
    setParentCategories((prev) => removeItemFromList(prev, id))
  } catch (error) {
    console.error(
      'Error occurred while deleting parent-category record:',
      error,
    )
    setError(error?.message)
    throw error
  }
}

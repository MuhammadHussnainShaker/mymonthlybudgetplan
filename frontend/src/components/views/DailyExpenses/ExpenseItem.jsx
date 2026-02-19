import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toNumber } from '@/utils/calculations'
import { createKeyDownHandler } from '@/utils/keyboard'

export default function ExpenseItem({
  id,
  index = 0,
  description: initialDescription = '',
  amount: initialAmount = 0,
  selectableCategories = [],
  categoryId: initialCategoryId,
  updateRecordFn,
  deleteRecordFn,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState(initialDescription)
  const [amount, setAmount] = useState(String(initialAmount))
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? '')

  useEffect(() => {
    setDescription(initialDescription)
    setAmount(String(initialAmount))
    setCategoryId(initialCategoryId ?? '')
  }, [initialDescription, initialAmount, initialCategoryId])

  async function handleBlur() {
    const trimmedDesc = description.trim()
    const amountInNum = toNumber(amount)

    if (trimmedDesc === '') {
      const deleteRecord = confirm(
        'Empty description will delete this record! Do you want to proceed?',
      )
      if (deleteRecord) {
        try {
          await deleteRecordFn(id)
        } catch (error) {
          console.error('Failed to delete expense record.', error)
          setDescription(initialDescription)
          setAmount(String(initialAmount))
          setCategoryId(initialCategoryId ?? '')
          alert('Failed to delete. Reverting changes.')
        } finally {
          setIsSubmitting(false)
        }
        return
      }
    }

    const body = {}
    if (trimmedDesc !== initialDescription) body.description = trimmedDesc
    if (amountInNum !== initialAmount) body.amount = amountInNum

    const initialCat = initialCategoryId ?? ''
    if (categoryId !== initialCat) {
      body.monthlyCategoricalExpenseId = categoryId === '' ? null : categoryId
    }

    if (Object.keys(body).length === 0) return

    setIsSubmitting(true)
    try {
      await updateRecordFn(id, body)
    } catch (error) {
      console.error('Failed to update expense record.', error)
      setDescription(initialDescription)
      setAmount(String(initialAmount))
      setCategoryId(initialCategoryId ?? '')
      alert('Failed to update. Reverting changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetValues = () => {
    setDescription(initialDescription)
    setAmount(String(initialAmount))
    setCategoryId(initialCategoryId ?? '')
  }

  const handleKeyDown = createKeyDownHandler(resetValues)

  const inputBase =
    'w-full rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'

  return (
    <div className='min-w-[720px] grid grid-cols-[3rem_1fr_8rem_1fr] gap-2 px-2 py-2 border border-slate-700/50 rounded'>
      <div className='flex items-center text-sm'>{index + 1}</div>

      <div className='relative'>
        <label className='sr-only' htmlFor={`description-${id}`}>
          Description
        </label>
        <input
          type='text'
          name={`description-${id}`}
          id={`description-${id}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={inputBase}
        />
        {isSubmitting && description !== initialDescription && <LoadingSpinner />}
      </div>

      <div className='relative'>
        <label className='sr-only' htmlFor={`amount-${id}`}>
          Amount
        </label>
        <input
          type='number'
          name={`amount-${id}`}
          id={`amount-${id}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSubmitting}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={[inputBase, 'text-right'].join(' ')}
        />
        {isSubmitting && amount != initialAmount && <LoadingSpinner />}
      </div>

      <div className='relative'>
        <label className='sr-only' htmlFor={`category-${id}`}>
          Category
        </label>
        <select
          name={`category-${id}`}
          id={`category-${id}`}
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isSubmitting}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={inputBase}
        >
          <option value=''>--Please choose an option--</option>
          {selectableCategories.length > 0 ? (
            selectableCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.description}
              </option>
            ))
          ) : (
            <option value='' disabled>
              --No category is made selectable from monthly expenses--
            </option>
          )}
        </select>
        {isSubmitting && categoryId != initialCategoryId && <LoadingSpinner />}
      </div>
    </div>
  )
}

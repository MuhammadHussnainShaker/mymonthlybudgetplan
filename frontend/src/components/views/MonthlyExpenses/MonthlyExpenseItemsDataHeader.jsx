import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createKeyDownHandler } from '@/utils/keyboard'
import {
  deleteParentCategory,
  updateParentCategory,
} from './parentCategoryCRUDFuncs'

export default function MonthlyExpenseItemsDataHeader({
  className = '',
  id,
  description: initialDescription = '',
  setRecordFn = async () => {},
  setError = async () => {},
}) {
  const [description, setDescription] = useState(initialDescription)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
      setDescription(initialDescription)
    }, [initialDescription])

  async function handleBlur() {
    const trimmedDesc = description.trim()

    if (trimmedDesc === '') {
      const deleteRecord = confirm(
        "Empty description will delete this parent category and all of it's monthly expense categories! Do you want to proceed?",
      )
      if (deleteRecord) {
        try {
          await deleteParentCategory(id, setRecordFn, setError)
        } catch (error) {
          console.error('Failed to delete parent category record.', error)
          setDescription(initialDescription)
          alert('Failed to delete. Reverting changes.')
        } finally {
          setIsSubmitting(false)
        }
        return
      }
    }

    const body = {}
    if (trimmedDesc !== initialDescription) body.description = trimmedDesc

    if (Object.keys(body).length === 0) return

    setIsSubmitting(true)
    try {
      await updateParentCategory(id, body, setRecordFn, setError)
    } catch (error) {
      console.error('Failed to update data item record.', error)
      setDescription(initialDescription)
      alert('Failed to update. Reverting changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetValues = () => {
    setDescription(initialDescription)
  }

  const handleKeyDown = createKeyDownHandler(resetValues)

  const inputBase =
    'w-full rounded border border-slate-700/10 bg-transparent px-2 py-1 text-sm'

  return (
    <div
      className={[
        'min-w-[720px]',
        'grid items-center',
        'grid-cols-[3rem_1fr_8rem_8rem_8rem]',
        'gap-2',
        'px-2 py-2',
        'text-sm font-medium',
        'border border-slate-700/50 rounded',
        className,
      ].join(' ')}
    >
      <div>#</div>
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
        {isSubmitting && description !== initialDescription && (
          <LoadingSpinner />
        )}
      </div>
      <div className='text-right'>Projected</div>
      <div className='text-right'>Actual</div>
      <div className='text-right'>Difference</div>
    </div>
  )
}

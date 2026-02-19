import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { calculateDifference, toNumber } from '@/utils/calculations'
import { createKeyDownHandler } from '@/utils/keyboard'

export default function DataItem({
  id,
  index = 0,
  description: initialDescription = '',
  projAmount: initialProjAmount = 0,
  actualAmount: initialActualAmount = 0,
  projMinusActual = true,
  isActualDisabled = false,
  updateRecordFn = async () => {},
  deleteRecordFn = async () => {},
  setRecordFn = async () => {},
  setError = async () => {},
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState(initialDescription)
  const [projAmount, setProjectedAmount] = useState(String(initialProjAmount))
  const [actualAmount, setActualAmount] = useState(String(initialActualAmount))

  useEffect(() => {
    setDescription(initialDescription)
    setProjectedAmount(String(initialProjAmount))
    setActualAmount(String(initialActualAmount))
  }, [initialDescription, initialProjAmount, initialActualAmount])

  async function handleBlur() {
    const trimmedDesc = description.trim()
    const projectedValue = toNumber(projAmount)
    const actualValue = toNumber(actualAmount)

    if (trimmedDesc === '') {
      const deleteRecord = confirm(
        'Empty description will delete this record! Do you want to proceed?',
      )
      if (deleteRecord) {
        try {
          await deleteRecordFn(id, setRecordFn, setError)
        } catch (error) {
          console.error('Failed to delete data item record.', error)
          setDescription(initialDescription)
          setProjectedAmount(String(initialProjAmount))
          setActualAmount(String(initialActualAmount))
          alert('Failed to delete. Reverting changes.')
        } finally {
          setIsSubmitting(false)
        }
        return
      }
    }

    const body = {}
    if (trimmedDesc !== initialDescription) body.description = trimmedDesc
    if (projectedValue !== initialProjAmount)
      body.projectedAmount = projectedValue
    if (actualValue !== initialActualAmount) body.actualAmount = actualValue

    if (Object.keys(body).length === 0) return

    setIsSubmitting(true)
    try {
      await updateRecordFn(id, body, setRecordFn, setError)
    } catch (error) {
      console.error('Failed to update data item record.', error)
      setDescription(initialDescription)
      setProjectedAmount(String(initialProjAmount))
      setActualAmount(String(initialActualAmount))
      alert('Failed to update. Reverting changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetValues = () => {
    setDescription(initialDescription)
    setProjectedAmount(String(initialProjAmount))
    setActualAmount(String(initialActualAmount))
  }

  const handleKeyDown = createKeyDownHandler(resetValues)

  const diffValue = calculateDifference(
    projAmount,
    actualAmount,
    projMinusActual,
  )

  const gridCols = 'grid-cols-[3rem_1fr_8rem_8rem_8rem]'

  const inputBase =
    'w-full rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'

  return (
    <div
      className={[
        'min-w-[720px]',
        'grid',
        gridCols,
        'gap-2',
        'px-2 py-2',
        'border border-slate-700/50 rounded',
      ].join(' ')}
    >
      <div className='flex items-center justify-start text-sm'>{index + 1}</div>

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

      <div className='relative'>
        <label className='sr-only' htmlFor={`projectedAmount-${id}`}>
          Projected Amount
        </label>
        <input
          type='number'
          name={`projectedAmount-${id}`}
          id={`projectedAmount-${id}`}
          value={projAmount}
          onChange={(e) => setProjectedAmount(e.target.value)}
          disabled={isSubmitting}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={[inputBase, 'text-right'].join(' ')}
        />
        {isSubmitting && projAmount != initialProjAmount && <LoadingSpinner />}
      </div>

      <div className='relative'>
        <label className='sr-only' htmlFor={`actualAmount-${id}`}>
          Actual Amount
        </label>
        <input
          type='number'
          name={`actualAmount-${id}`}
          id={`actualAmount-${id}`}
          value={actualAmount}
          onChange={(e) => setActualAmount(e.target.value)}
          disabled={isSubmitting || isActualDisabled}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={[inputBase, 'text-right'].join(' ')}
        />
        {isSubmitting && actualAmount != initialActualAmount && (
          <LoadingSpinner />
        )}
      </div>

      <div>
        <label className='sr-only' htmlFor={`difference-${id}`}>
          Difference
        </label>
        <input
          type='number'
          name={`difference-${id}`}
          id={`difference-${id}`}
          value={diffValue}
          disabled
          className={[inputBase, 'text-right opacity-80'].join(' ')}
        />
      </div>
    </div>
  )
}

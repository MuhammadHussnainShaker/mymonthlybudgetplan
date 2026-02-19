import { useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createKeyDownHandler } from '@/utils/keyboard'
import useMonthStore from '@/store/useMonthStore'

export default function CreateDataItem({
  createRecordFn = async () => {},
  parentId = '',
  placeholder = 'New item...',
  setRecordFn = async () => {},
  setError = async () => {},
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState('')
  const month = useMonthStore((state) => state.month)

  async function handleBlur() {
    const trimmedDesc = description.trim()
    const body = {}
    if (trimmedDesc !== '') body.description = trimmedDesc
    if (Object.keys(body).length === 0) return

    setIsSubmitting(true)
    body.month = month
    if (parentId) body.parentId = parentId
    try {
      await createRecordFn(body, setRecordFn, setError)
      setDescription('')
    } catch (error) {
      console.error('Failed to create data item record.', error)
      alert('Failed to create record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = createKeyDownHandler(() => setDescription(''))

  const inputBase =
    'w-full rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'

  return (
    <div
      className={[
        'min-w-[720px]',
        'grid grid-cols-[3rem_1fr_8rem_8rem_8rem]',
        'gap-2',
        'px-2 py-2',
        'border border-dashed border-slate-700/50 rounded',
      ].join(' ')}
    >
      <div className='flex items-center justify-start font-medium'>+</div>

      <div className='relative'>
        <label className='sr-only' htmlFor='createDescription'>
          New item description
        </label>
        <input
          type='text'
          name='createDescription'
          id='createDescription'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={inputBase}
          placeholder={placeholder}
        />
        {isSubmitting && <LoadingSpinner />}
      </div>

      {/* Commenting out below inputs because I thought they are un-necessary
      but don't deleting them thinking we might uncomment them in the future.  */}
      {/* <div>
        <input
          type='number'
          disabled
          className={[inputBase, 'text-right opacity-60'].join(' ')}
        />
      </div>
      <div>
        <input
          type='number'
          disabled
          className={[inputBase, 'text-right opacity-60'].join(' ')}
        />
      </div>
      <div>
        <input
          type='number'
          disabled
          className={[inputBase, 'text-right opacity-60'].join(' ')}
        />
      </div> */}
    </div>
  )
}

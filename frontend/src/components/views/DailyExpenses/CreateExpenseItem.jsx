import { useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createKeyDownHandler } from '@/utils/keyboard'

export default function CreateExpenseItem({ createRecordFn, date = '2026-01-20' }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState('')

  async function handleBlur() {
    const trimmedDesc = description.trim()
    const body = {}
    if (trimmedDesc !== '') body.description = trimmedDesc
    if (Object.keys(body).length === 0) return

    setIsSubmitting(true)
    body.date = new Date(date).toISOString()
    try {
      await createRecordFn(body)
      setDescription('')
    } catch (error) {
      console.error('Failed to create expense record.', error)
      alert('Failed to create record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = createKeyDownHandler(() => setDescription(''))

  const inputBase =
    'w-full rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'

  return (
    <div className='min-w-[720px] grid grid-cols-[3rem_1fr_8rem_1fr] gap-2 px-2 py-2 border border-dashed border-slate-700/50 rounded'>
      <div className='flex items-center font-medium'>+</div>

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
          placeholder='New expense...'
        />
        {isSubmitting && <LoadingSpinner />}
      </div>

      <div>
        <input type='number' disabled className={[inputBase, 'text-right opacity-60'].join(' ')} />
      </div>

      <div />
    </div>
  )
}

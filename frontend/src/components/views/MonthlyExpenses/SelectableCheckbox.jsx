import { useEffect, useState } from 'react'

export default function SelectableCheckbox({
  id,
  initialSelectable = false,
  toggleSelectableFn = async () => {},
}) {
  const [selectable, setSelectable] = useState(initialSelectable)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => setSelectable(initialSelectable), [initialSelectable])

  const onChange = async (e) => {
    const newVal = e.target.checked

    const proceed = confirm(
      newVal
        ? 'Do you really want to make this category selectable? This action will clear the actual amount value of this category and actual amount will be calculated from daily expenses having this category. Proceed with caution!'
        : 'Do you really want to make this category un-selectable? This action will move all of your daily expenses having this category to others category. Proceed with caution!',
    )
    if (!proceed) return

    setSelectable(newVal)
    setIsSubmitting(true)
    try {
      await toggleSelectableFn(id, { selectable: newVal })
    } catch {
      setSelectable((prev) => !prev)
      alert('Failed to update. Reverting changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <input
      type='checkbox'
      name={`selectable-${id}`}
      id={`selectable-${id}`}
      checked={selectable}
      onChange={onChange}
      disabled={isSubmitting}
      className='h-4 w-4'
      aria-label='Selectable'
    />
  )
}

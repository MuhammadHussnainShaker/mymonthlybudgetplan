import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/services/firebase/firebaseClient'
import ErrorMessage from '@/components/ui/ErrorMessage'
import FullPageSpinner from '@/components/ui/FullPageSpinner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      })
      setSuccess(true)
    } catch (err) {
      setError(err?.code || 'Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className='max-w-md mx-auto space-y-3'>
        <p className='text-sm text-slate-400'>
          Password reset email sent. Check your inbox.
        </p>
      </div>
    )
  }

  if (isSubmitting)
    return <FullPageSpinner message='Sending password reset email...' />

  return (
    <div className='max-w-md mx-auto space-y-3'>
      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='grid gap-1'>
          <label htmlFor='email' className='text-sm'>
            Email
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='email'
            name='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded bg-gray-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50'
        >
          Send Reset Email
        </button>
      </form>
    </div>
  )
}

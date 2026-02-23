import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/services/firebase/firebaseClient'
import ErrorMessage from '@/components/ui/ErrorMessage'
import FullPageSpinner from '@/components/ui/FullPageSpinner'
import ButtonComponent from '@/components/ui/ButtonComponent'
import InputComponent from '@/components/ui/InputComponent'

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
        <InputComponent
          label='Email'
          type='email'
          name='email'
          id='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder='Enter your email'
        />

        <ButtonComponent type='submit' disabled={isSubmitting}>
          Send Reset Email
        </ButtonComponent>
      </form>
    </div>
  )
}

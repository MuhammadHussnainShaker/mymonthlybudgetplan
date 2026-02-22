import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '@/services/firebase/firebaseClient'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignUp = async (user) => {
    const createdAt = new Date(user.metadata.creationTime).getTime()
    const now = new Date().getTime()

    // Only send email if the account was created in the last 10 seconds
    const isNewAccount = now - createdAt < 10000

    if (!isNewAccount) {
      console.log('Restored session detected. Skipping auto-email.')
      return
    }
    try {
      const verificationUrl = import.meta.env.DEV
        ? 'http://localhost:5173/login'
        : `${window.location.origin}/login`

      await sendEmailVerification(user, {
        url: verificationUrl,
      })

      navigate('/verify-email')
    } catch (err) {
      console.error('Error during signup:', err)
      setError(err?.message || 'Failed to send verification email')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await handleSignUp(userCredential.user)
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err?.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

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

        <div className='grid gap-1'>
          <label htmlFor='password' className='text-sm'>
            Password
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='password'
            name='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className='grid gap-1'>
          <label htmlFor='confirmPassword' className='text-sm'>
            Confirm Password
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='password'
            name='confirmPassword'
            id='confirmPassword'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className='text-sm text-center text-slate-400'>
        Already have an account?{' '}
        <Link to='/login' className='text-blue-400 hover:text-blue-300'>
          Sign in
        </Link>
      </p>
    </div>
  )
}

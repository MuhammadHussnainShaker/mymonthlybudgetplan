import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'
import ErrorMessage from '@/components/ui/ErrorMessage'
import FullPageSpinner from '@/components/ui/FullPageSpinner'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPW, setConfirmPW] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const auth = getAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPW) {
      setError('Passwords do not match')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/login`,
      })
      navigate('/verify-email')
    } catch (err) {
      console.error('Error signing up:', err.code)
      setError(err?.code || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) return <FullPageSpinner message='Signing up...' />

  return (
    <div className='max-w-md mx-auto space-y-3'>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='grid gap-1'>
          <label htmlFor='email' className='text-sm'>
            Email:{' '}
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='email'
            name='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className='grid gap-1'>
          <label htmlFor='password' className='text-sm'>
            Password:{' '}
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='password'
            name='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className='grid gap-1'>
          <label htmlFor='confirmPW' className='text-sm'>
            Confirm Password:{' '}
          </label>
          <input
            className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
            type='password'
            name='confirmPW'
            id='confirmPW'
            value={confirmPW}
            onChange={(e) => setConfirmPW(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded bg-gray-950 mt-4 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 hover:cursor-pointer disabled:opacity-50'
          >
            Sign Up
          </button>
        </div>
      </form>
      <p className='text-sm text-center text-slate-600'>
        Already have and account{' '}
        <Link to='/login' className='text-sky-400 hover:text-sky-300'>
          Login
        </Link>
      </p>
    </div>
  )
}

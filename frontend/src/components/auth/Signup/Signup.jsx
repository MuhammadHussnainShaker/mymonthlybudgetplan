import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'
import ErrorMessage from '@/components/ui/ErrorMessage'
import FullPageSpinner from '@/components/ui/FullPageSpinner'
import InputComponent from '@/components/ui/InputComponent'
import ButtonComponent from '@/components/ui/ButtonComponent'

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
        <InputComponent
          label='Email'
          type='email'
          name='email'
          id='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          placeholder='Enter your email'
        />
        <InputComponent
          label='Password'
          type='password'
          name='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
          placeholder='Enter your password'
        />
        <InputComponent
          label='Confirm Password'
          type='password'
          name='confirmPW'
          id='confirmPW'
          value={confirmPW}
          onChange={(e) => setConfirmPW(e.target.value)}
          disabled={isSubmitting}
          required
          placeholder='Confirm your password'
        />
        <ButtonComponent type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </ButtonComponent>
      </form>
      <p className='text-sm text-center text-slate-600'>
        Already have an account{' '}
        <Link to='/login' className='text-sky-400 hover:text-sky-300'>
          Login
        </Link>
      </p>
    </div>
  )
}

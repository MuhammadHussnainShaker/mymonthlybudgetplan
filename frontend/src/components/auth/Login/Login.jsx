import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'
import { auth } from '@/services/firebase/firebaseClient'
import useUserStore from '@/store/useUserStore'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { apiAuthFetch } from '@/utils/apiFetch'
import FullPageSpinner from '@/components/ui/FullPageSpinner'
import InputComponent from '@/components/ui/InputComponent'
import ButtonComponent from '@/components/ui/ButtonComponent'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const login = useUserStore((state) => state.login)
  const navigate = useNavigate()

  const handleResendVerificationEmail = async () => {
    setIsResending(true)
    setError('')

    try {
      const user = auth.currentUser
      if (!user) {
        setError(
          'No user is currently signed in, Please try to sign in with your email and password first',
        )
        return
      }

      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`,
      })

      navigate('/verify-email')
    } catch (err) {
      console.error('Error resending verification email:', err?.code)
      setError(err?.code || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleSignIn = async (user) => {
    try {
      const isEmailVerified = user.emailVerified

      if (!isEmailVerified) {
        setError(
          'Please verify your email address before logging in. Check your inbox for the verification link.',
        )
        setShowResend(true)
        return
      }

      try {
        const response = await apiAuthFetch('/api/v1/auth/bootstrap', {
          method: 'POST',
        })

        login(response.data.user)

        navigate('/dashboard')
      } catch (err) {
        console.error('Error bootstrapping user:', err)
        setError(err?.message || 'Failed to initialize user account')
      }
    } catch (err) {
      console.error('Error during login:', err)
      setError(err?.message || 'Login failed')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setShowResend(false)

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      await handleSignIn(userCredential.user)
    } catch (err) {
      console.error('Error signing in:', err?.code)
      setError(err?.code || 'Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) return <FullPageSpinner message='Signing in...' />
  if (isResending)
    return <FullPageSpinner message='Sending verfication email...' />

  return (
    <div className='max-w-md mx-auto space-y-3'>
      <ErrorMessage message={error} />

      {showResend && !isResending && (
        <div className='text-center'>
          <button
            onClick={handleResendVerificationEmail}
            className='text-sm text-sky-400 hover:text-sky-300 underline'
          >
            Resend verification email
          </button>
        </div>
      )}

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
        <InputComponent
          label='Password'
          type='password'
          name='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder='Enter your password'
        />

        <div className='text-right'>
          <Link
            to='/forgot-password'
            className='text-sm text-sky-400 hover:text-sky-300'
          >
            Forgot password?
          </Link>
        </div>

        <ButtonComponent type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </ButtonComponent>
      </form>

      <p className='text-sm text-center text-slate-400'>
        Don&apos;t have an account?{' '}
        <Link to='/signup' className='text-sky-400 hover:text-sky-300'>
          Sign up
        </Link>
      </p>
    </div>
  )
}

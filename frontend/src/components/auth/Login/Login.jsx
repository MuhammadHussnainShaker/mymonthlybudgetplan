import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '@/services/firebase/firebaseClient'
import useUserStore from '@/store/useUserStore'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { apiAuthFetch } from '@/utils/apiFetch'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const navigate = useNavigate()
  const login = useUserStore((state) => state.login)

  const handleResendVerification = async () => {
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

      const verificationUrl = import.meta.env.DEV
        ? 'http://localhost:5173/login'
        : `${window.location.origin}/login`

      await sendEmailVerification(user, {
        url: verificationUrl,
      })

      navigate('/verify-email')
    } catch (err) {
      console.error('Error resending verification email:', err)
      setError(err?.message || 'Failed to resend verification email')
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await handleSignIn(userCredential.user)
    } catch (err) {
      console.error('Error signing in:', err)
      setError(err?.message || 'Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='max-w-md mx-auto space-y-3'>
      <ErrorMessage message={error} />

      {showResend && !isResending && (
        <div className='text-center'>
          <button
            onClick={handleResendVerification}
            className='text-sm text-blue-400 hover:text-blue-300 underline'
          >
            Resend verification email
          </button>
        </div>
      )}

      {isResending && (
        <p className='text-sm text-center text-slate-400'>
          Sending verification email...
        </p>
      )}

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

        <div className='text-right'>
          <Link to='/forgot-password' className='text-sm text-blue-400 hover:text-blue-300'>
            Forgot password?
          </Link>
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className='text-sm text-center text-slate-400'>
        Don&apos;t have an account?{' '}
        <Link to='/signup' className='text-blue-400 hover:text-blue-300'>
          Sign up
        </Link>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { SignInAuthScreen } from '@firebase-oss/ui-react'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/services/firebase/firebaseClient'
import useUserStore from '@/store/useUserStore'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { apiAuthFetch } from '@/utils/apiFetch'

export default function Login() {
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

      <SignInAuthScreen
        onSignIn={handleSignIn}
        onForgotPasswordClick={() => navigate('/forgot-password')}
      />
    </div>
  )
}

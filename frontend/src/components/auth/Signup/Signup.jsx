import { useState } from 'react'
import { useNavigate } from 'react-router'
import { SignUpAuthScreen } from '@firebase-oss/ui-react'
import { sendEmailVerification } from 'firebase/auth'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function Signup() {
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

      // // Sign out the user immediately after signup -> No need TODO: delete it
      // await auth.signOut()

      navigate('/verify-email')
    } catch (err) {
      console.error('Error during signup:', err)
      setError(err?.message || 'Failed to send verification email')
    }
  }

  return (
    <div className='max-w-md mx-auto space-y-3'>
      <ErrorMessage message={error} />
      <SignUpAuthScreen onSignUp={handleSignUp} />
    </div>
  )
}

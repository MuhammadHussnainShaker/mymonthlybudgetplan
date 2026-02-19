import { Link } from 'react-router'

export default function VerifyEmail() {
  return (
    <div className='max-w-md mx-auto space-y-6 text-center'>
      <div className='space-y-3'>
        <h1 className='text-2xl font-semibold'>Verify Your Email</h1>
        <p className='text-slate-400'>
          We've sent you an email with a verification link. Please check your
          inbox and click the link to verify your email address.
        </p>
      </div>

      <div className='space-y-2'>
        <p className='text-sm text-slate-400'>
          Once you've verified your email, you can log in to your account.
        </p>
        <Link
          to='/login'
          className='inline-block px-4 py-2 text-sm border border-slate-700/50 rounded hover:bg-slate-800/50 transition-colors'
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}

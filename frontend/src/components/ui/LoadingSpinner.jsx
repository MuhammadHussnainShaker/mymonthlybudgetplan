export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={['absolute right-2 top-1/2 -translate-y-1/2', className].join(' ')}>
      <div className='h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-slate-200' />
    </div>
  )
}

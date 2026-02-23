export default function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-50'>
      <div className='w-20 h-20 border-4 border-sky-200 border-t-indigo-600 rounded-full animate-spin mb-4' />
      <p className='text-gray-600 text-lg'>{message}</p>
    </div>
  )
}
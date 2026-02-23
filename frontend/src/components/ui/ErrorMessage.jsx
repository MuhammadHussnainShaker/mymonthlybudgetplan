export default function ErrorMessage({ message }) {
  if (!message) return null

  return <p className='text-red-700 text-sm'>{message}</p>
}

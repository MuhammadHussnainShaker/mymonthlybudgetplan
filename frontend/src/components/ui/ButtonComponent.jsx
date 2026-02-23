export default function ButtonComponent({
  children,
  type = 'submit',
  disabled = false,
  onClick,
  className = '',
  variant = 'primary',
  ...props
}) {
  const baseStyles =
    'w-full rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50'

  const variants = {
    primary: 'bg-gray-950 text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${!disabled ? 'hover:cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

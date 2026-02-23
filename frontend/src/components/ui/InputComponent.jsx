import { useState } from 'react'

export default function InputComponent({
  label,
  type = 'text',
  name,
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className='grid gap-1'>
      <label htmlFor={id} className='text-sm'>
        {label}
        {required && ' *'}
      </label>

      <div className='relative'>
        <input
          className={`w-full
            rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm
            ${isPassword ? 'pr-8' : ''}
          `}
          type={inputType}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          {...props}
        />

        {isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700'
            tabIndex='-1'
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  )
}

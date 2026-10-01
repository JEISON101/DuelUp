import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '../../lib/utils'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function PasswordInput({ label, className, error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='w-full space-y-2'>
      {label ? <label className='block text-sm font-medium text-white'>{label}</label> : null}

      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'w-full rounded-full border border-white/15 bg-navy px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white-subtle focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple/30 disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className,
          )}
          {...props}
        />

        <button
          type='button'
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className='absolute inset-y-0 right-3 flex items-center text-white-subtle transition-colors hover:text-white'
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error ? <p className='text-xs text-red-400'>{error}</p> : null}
    </div>
  )
}

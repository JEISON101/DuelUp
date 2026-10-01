import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className, error, ...props },
  ref,
) {
  return (
    <div className='w-full space-y-2'>
      {label ? (
        <label className='block text-sm font-medium text-white'>{label}</label>
      ) : null}

      <input
        ref={ref}
        className={cn(
          'w-full rounded-full border border-white/15 bg-navy px-3 py-2.5 text-sm text-white placeholder:text-white-subtle focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple/30 disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          className,
        )}
        {...props}
      />

      {error ? <p className='text-xs text-red-400'>{error}</p> : null}
    </div>
  )
})

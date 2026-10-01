import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const baseStyles =
  'flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-purple text-white hover:bg-[#9b6ef6]',
  secondary: 'bg-blue text-white hover:bg-blue-hover',
  ghost: 'border border-white/15 bg-transparent text-white hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-400',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size='sm' className='border-2' /> : null}
      {!isLoading && leftIcon ? <span>{leftIcon}</span> : null}
      <span>{children}</span>
      {!isLoading && rightIcon ? <span>{rightIcon}</span> : null}
    </button>
  )
}

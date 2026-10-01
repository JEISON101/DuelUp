import { cn } from '../../lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
}

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  return (
    <div className='flex items-center gap-2 text-white-muted'>
      <span
        aria-label={label ?? 'Loading'}
        className={cn(
          'inline-block animate-spin rounded-full border-b-purple border-l-transparent border-r-transparent border-t-blue',
          sizeMap[size],
          className,
        )}
      />
      {label ? <span className='text-sm'>{label}</span> : null}
    </div>
  )
}

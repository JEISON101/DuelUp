import { Globe } from 'lucide-react'

import { Button } from '../ui/Button'

interface GoogleButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function GoogleButton({ onClick, isLoading, disabled }: GoogleButtonProps) {
  return (
    <Button
      type='button'
      variant='secondary'
      className='w-full bg-white text-navy hover:bg-slate-100'
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      leftIcon={<Globe size={18} />}
    >
      Continuar con Google
    </Button>
  )
}

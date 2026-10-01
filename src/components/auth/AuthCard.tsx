import type { ReactNode } from 'react'

import jokerImage from '../../assets/joker.jpg'
import { Card } from '../ui/Card'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const cardStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(3, 8, 36, 0.85), rgba(108, 130, 150, 0.69)), url(${jokerImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }

  return (
    <Card
      className='w-full max-w-lg overflow-hidden border-white/10 p-6 shadow-[0_20px_60px_var(--color-purple)]'
      style={cardStyle}
    >
      <div className='mb-6 text-center'>
        <span className='inline-flex rounded-full border border-purple/30 bg-purple-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple'>DuelUP</span>
        <h1 className='mt-4 text-2xl font-bold text-white'>{title}</h1>
        {subtitle ? <p className='mt-2 text-sm text-white-muted'>{subtitle}</p> : null}
      </div>

      {children}
    </Card>
  )
}

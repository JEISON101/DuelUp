import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-midnight text-white'>
        <Spinner size='lg' label='Cargando...' />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to='/app/home' replace />
  }

  return <Outlet />
}

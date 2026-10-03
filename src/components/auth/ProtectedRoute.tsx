import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-page text-white'>
        <Spinner size='lg' label='Comprobando sesión...' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

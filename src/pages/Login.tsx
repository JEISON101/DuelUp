
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthCard } from '../components/auth/AuthCard'
import { LoginForm, type LoginFormValues } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage, signIn, signInWithGoogle } from '../services/auth'

const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await signIn(values)
      toast.success('Sesión iniciada correctamente.')
      setSuccessMessage('Sesión iniciada correctamente.')
      navigate('/app/home', { replace: true })
    } catch (error) {
      const message = getAuthErrorMessage(error, 'No pudimos iniciar sesión.')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setSubmitError('')
    setSuccessMessage('')
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle()
      toast.success('Redirigiendo a Google...')
    } catch (error) {
      const message = getAuthErrorMessage(error, 'No pudimos iniciar sesión con Google.')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-midnight px-4'>
      <AuthCard title='Inicia sesión' subtitle='Accede a tu perfil y a tus partidas.'>
        <LoginForm
          onSubmit={handleSubmit}
          onGoogleClick={handleGoogleLogin}
          isSubmitting={isSubmitting}
          isGoogleLoading={isGoogleLoading}
          submitError={submitError}
          successMessage={successMessage}
        />
      </AuthCard>
    </div>
  )
}

export default Login

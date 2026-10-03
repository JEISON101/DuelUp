import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthCard } from '../components/auth/AuthCard'
import { RegisterForm, type RegisterFormValues } from '../components/auth/RegisterForm'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage, signUp } from '../services/auth'
import { createProfileIfMissing } from '../services/profile'

const Register = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (values: RegisterFormValues) => {
    setSubmitError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const { user, session } = await signUp(values)

      if (user && session) {
        await createProfileIfMissing(user.id, values.username)
        toast.success('Cuenta creada correctamente.')
        navigate('/app/home', { replace: true })
        return
      }

      if (user && !session) {
        await createProfileIfMissing(user.id, values.username)
        const message = 'Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.'
        setSuccessMessage(message)
        toast.success(message)
        return
      }

      setSuccessMessage('Cuenta creada correctamente.')
    } catch (error) {
      const message = getAuthErrorMessage(error, 'No pudimos crear tu cuenta.')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-page px-4'>
      <AuthCard title='Crea tu cuenta' subtitle='Únete a DuelUP y empieza a jugar.'>
        <RegisterForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          successMessage={successMessage}
        />
      </AuthCard>
    </div>
  )
}

export default Register

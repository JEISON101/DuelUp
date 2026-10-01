import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'

const registerSchema = z
  .object({
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres.').max(24, 'Máximo 24 caracteres.'),
    email: z.string().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').regex(/[A-Za-z]/, 'Incluye letras.').regex(/[0-9]/, 'Incluye al menos un número.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void> | void
  isSubmitting?: boolean
  submitError?: string
  successMessage?: string
}

export function RegisterForm({
  onSubmit,
  isSubmitting = false,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  return (
    <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('username')}
        label='Usuario'
        placeholder='tu_usuario'
        error={errors.username?.message}
      />

      <Input
        {...register('email')}
        type='email'
        label='Correo electrónico'
        placeholder='tu@duelup.com'
        error={errors.email?.message}
      />

      <PasswordInput
        {...register('password')}
        label='Contraseña'
        placeholder='••••••••'
        error={errors.password?.message}
      />

      <PasswordInput
        {...register('confirmPassword')}
        label='Confirmar contraseña'
        placeholder='••••••••'
        error={errors.confirmPassword?.message}
      />

      <Button type='submit' className='w-full' isLoading={isSubmitting}>
        {isSubmitting ? 'Creando' : 'Crear'} cuenta
      </Button>

      <p className='text-center text-sm text-white-muted'>
        Ya tienes cuenta?{' '}
        <Link to='/login' className='font-medium text-purple hover:text-purple/80'>Inicia sesión</Link>
      </p>
    </form>
  )
}

import { supabase } from '../lib/supabase'

export type SignInPayload = {
  email: string
  password: string
}

export type SignUpPayload = {
  username: string
  email: string
  password: string
}

export function getAuthErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.') {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''

  if (!message) {
    return fallback
  }

  const lowered = message.toLowerCase()

  if (lowered.includes('over_email_send_rate_limit') || lowered.includes('50 seconds')) {
    return 'Se enviaron demasiadas solicitudes. Espera 50 segundos antes de intentarlo de nuevo.'
  }

  if (lowered.includes('invalid login credentials') || lowered.includes('invalid credentials')) {
    return 'El correo o la contraseña no son correctos.'
  }

  if (lowered.includes('user already registered') || lowered.includes('already registered')) {
    return 'Este correo ya está registrado.'
  }

  if (lowered.includes('email not confirmed') || lowered.includes('verify')) {
    return 'Debes verificar tu correo antes de continuar.'
  }

  if (lowered.includes('oauth') || lowered.includes('provider')) {
    return 'No pudimos iniciar sesión con Google.'
  }

  if (lowered.includes('signup') || lowered.includes('sign up')) {
    return 'No pudimos crear tu cuenta.'
  }

  if (lowered.includes('network') || lowered.includes('fetch')) {
    return 'Hubo un problema de conexión. Inténtalo de nuevo.'
  }

  return fallback
}

export async function signUp({ username, email, password }: SignUpPayload) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signIn({ email, password }: SignInPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/app/home`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}

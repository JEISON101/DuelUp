import { supabase } from '../lib/supabase'

export type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  xp: number | null
  created_at: string
  updated_at: string
}

export type PublicProfile = Pick<Profile, 'id' | 'username' | 'avatar_url' | 'xp'>

const RANDOM_USERNAME_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function generateRandomUsername() {
  return Array.from({ length: 8 }, () =>
    RANDOM_USERNAME_ALPHABET[Math.floor(Math.random() * RANDOM_USERNAME_ALPHABET.length)],
  ).join('')
}

export async function getTopProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, xp')
    .order('xp', { ascending: false })
    .limit(3)

  if (error) {
    throw error
  }

  return data as PublicProfile[]
}

export async function searchProfilesByUsername(query: string, currentUserId: string) {
  const normalizedQuery = query.trim().replace(/[%,_]/g, '')
  if (normalizedQuery.length < 2) {
    return []
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, xp')
    .ilike('username', `%${normalizedQuery}%`)
    .neq('id', currentUserId)
    .limit(8)

  if (error) {
    throw error
  }

  return data as PublicProfile[]
}

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return data as Profile
  }

  const metadata = user.user_metadata ?? {}
  const metadataUsername = [metadata.username, metadata.full_name, metadata.name]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const emailUsername = user.email?.split('@')[0]
  const avatarUrl = [metadata.avatar_url, metadata.picture]
    .find((value): value is string => typeof value === 'string' && value.length > 0)

  if (user.app_metadata?.provider === 'google') {
    return createGoogleProfile(user.id, avatarUrl)
  }

  return createProfileIfMissing(user.id, metadataUsername ?? emailUsername, avatarUrl)
}

async function createGoogleProfile(userId: string, avatarUrl?: string | null) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await createProfileIfMissing(userId, generateRandomUsername(), avatarUrl)
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505' &&
        attempt < 4
      ) {
        continue
      }

      throw error
    }
  }

  throw new Error('No pudimos generar un nombre de usuario único.')
}

export async function createProfileIfMissing(
  userId: string,
  username?: string,
  avatarUrl?: string | null,
) {
  const safeUsername = (username || '').trim() || 'player'

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        username: safeUsername,
        avatar_url: avatarUrl ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
    .select()
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return data as Profile
  }

  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) {
    throw profileError
  }

  return existingProfile as Profile
}

function getOwnedAvatarPath(avatarUrl: string | null, userId: string) {
  if (!avatarUrl) return null

  try {
    const path = new URL(avatarUrl).pathname.split('/storage/v1/object/public/avatars/')[1]
    const decodedPath = path ? decodeURIComponent(path) : null
    return decodedPath?.startsWith(`${userId}/`) ? decodedPath : null
  } catch {
    return null
  }
}

export async function updateProfile(username: string, avatarFile: File | null) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('No hay un usuario autenticado.')
  }

  const normalizedUsername = username.trim()
  if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
    throw new Error('El nombre debe tener entre 3 y 24 caracteres.')
  }
  if (!/^[\p{L}\p{N}_]+$/u.test(normalizedUsername)) {
    throw new Error('Usa solo letras, números y guion bajo en el nombre.')
  }
  if (avatarFile && !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(avatarFile.type)) {
    throw new Error('El avatar debe ser una imagen JPG, PNG, WEBP o GIF.')
  }
  if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 5 MB.')
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (currentProfileError) throw currentProfileError

  let uploadedPath: string | null = null
  let nextAvatarUrl = currentProfile.avatar_url
  if (avatarFile) {
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    }
    uploadedPath = `${user.id}/${crypto.randomUUID()}.${extensionByType[avatarFile.type]}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(uploadedPath, avatarFile, { contentType: avatarFile.type, upsert: false })

    if (uploadError) throw uploadError
    nextAvatarUrl = supabase.storage.from('avatars').getPublicUrl(uploadedPath).data.publicUrl
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: normalizedUsername,
      avatar_url: nextAvatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ese nombre de usuario ya está en uso.')
    }
    if (uploadedPath) {
      await supabase.storage.from('avatars').remove([uploadedPath])
    }
    throw error
  }

  if (uploadedPath) {
    const oldAvatarPath = getOwnedAvatarPath(currentProfile.avatar_url, user.id)
    if (oldAvatarPath) {
      const { error: removeError } = await supabase.storage.from('avatars').remove([oldAvatarPath])
      if (removeError) console.warn('Could not remove replaced avatar:', removeError)
    }
  }

  return data as Profile
}

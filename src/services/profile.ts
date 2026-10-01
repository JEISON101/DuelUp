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

  return createProfileIfMissing(user.id, metadataUsername ?? emailUsername, avatarUrl)
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
        xp: 0,
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

export async function updateProfile(profile: Partial<Profile>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('No hay un usuario autenticado.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Profile
}

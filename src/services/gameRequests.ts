import { supabase } from '../lib/supabase'

export type GameRequestStatus = 'pendiente' | 'aceptado' | 'rechazado' | 'expirado'

export type GameRequest = {
  id: string
  sender_id: string
  receiver_id: string
  status: GameRequestStatus
  created_at: string
  expires_at: string | null
  sender: { username: string | null; avatar_url: string | null } | null
  receiver: { username: string | null; avatar_url: string | null } | null
}

export async function getGameRequests(userId: string) {
  const { data, error } = await supabase
    .from('game_requests')
    .select(`
      id,
      sender_id,
      receiver_id,
      status,
      created_at,
      expires_at,
      sender:profiles!game_requests_sender_id_fkey(username, avatar_url),
      receiver:profiles!game_requests_receiver_id_fkey(username, avatar_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw error
  }

  const currentTime = Date.now()
  return (data as unknown as GameRequest[]).map((request) =>
    request.status === 'pendiente' && request.expires_at && Date.parse(request.expires_at) <= currentTime
      ? { ...request, status: 'expirado' as const }
      : request,
  )
}

export async function createGameRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    throw new Error('No puedes desafiarte a ti mismo.')
  }

  const { data: existingRequests, error: lookupError } = await supabase
    .from('game_requests')
    .select('id, sender_id, receiver_id, status, expires_at')
    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)

  if (lookupError) {
    throw lookupError
  }

  const hasPendingRequest = existingRequests.some((request) =>
    request.status === 'pendiente' && (!request.expires_at || Date.parse(request.expires_at) > Date.now()),
  )
  if (hasPendingRequest) {
    throw new Error('Ya existe un desafío pendiente entre estos jugadores.')
  }

  const { data, error } = await supabase
    .from('game_requests')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (error?.code === '23505') {
    throw new Error('Ya existe un desafío pendiente entre estos jugadores.')
  }
  if (error) {
    throw error
  }

  return data.id as string
}

export async function acceptGameRequest(requestId: string) {
  const { data, error } = await supabase.rpc('accept_game_request', {
    p_request_id: requestId,
  })

  if (error) {
    throw error
  }

  return data as string
}

export async function rejectGameRequest(requestId: string) {
  const { error } = await supabase.rpc('reject_game_request', {
    p_request_id: requestId,
  })

  if (error) {
    throw error
  }
}

export async function findGameForRequest(request: GameRequest) {
  if (request.status !== 'aceptado') {
    return null
  }

  const { data, error } = await supabase
    .from('games')
    .select('id')
    .eq('player_one_id', request.sender_id)
    .eq('player_two_id', request.receiver_id)
    .gte('created_at', request.created_at)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data?.id ?? null
}
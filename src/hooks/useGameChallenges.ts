import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '../lib/supabase'
import {
  acceptGameRequest,
  createGameRequest,
  getGameRequests,
  rejectGameRequest,
} from '../services/gameRequests'
import type { GameRequestStatus } from '../services/gameRequests'

export function useGameChallenges(userId: string | undefined) {
  const queryClient = useQueryClient()
  const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING')
  const queryKey = ['game-requests', userId]
  const previousStatuses = useRef(new Map<string, GameRequestStatus>())
  const hasLoadedRequests = useRef(false)
  const requestsQuery = useQuery({
    queryKey,
    queryFn: () => getGameRequests(userId!),
    enabled: Boolean(userId),
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (!userId || !requestsQuery.data) {
      return
    }

    requestsQuery.data.forEach((request) => {
      const previousStatus = previousStatuses.current.get(request.id)

      if (
        hasLoadedRequests.current &&
        request.receiver_id === userId &&
        previousStatus === undefined &&
        request.status === 'pendiente'
      ) {
        toast.info(`${request.sender?.username || 'Un jugador'} te ha desafiado.`)
      }

      if (
        request.sender_id === userId &&
        previousStatus === 'pendiente' &&
        request.status === 'rechazado'
      ) {
        toast.info('Tu desafío fue rechazado.')
      }

      previousStatuses.current.set(request.id, request.status)
    })
    hasLoadedRequests.current = true
  }, [requestsQuery.data, userId])

  useEffect(() => {
    if (!userId) {
      return
    }

    const channel = supabase
      .channel(`game-requests-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_requests'
      }, () => {
        void queryClient.invalidateQueries({ queryKey: ['game-requests', userId] })
      })
      .subscribe((status, error) => {
        setRealtimeStatus(status)
        if (error) {
          console.error('Game requests Realtime subscription error:', error)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient, userId])

  const createMutation = useMutation({
    mutationFn: (challengedId: string) => createGameRequest(userId!, challengedId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptGameRequest(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectGameRequest(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    realtimeStatus,
    sendChallenge: createMutation.mutateAsync,
    acceptChallenge: acceptMutation.mutateAsync,
    rejectChallenge: rejectMutation.mutateAsync,
    isSending: createMutation.isPending,
    processingRequestId: acceptMutation.variables ?? rejectMutation.variables ?? null,
  }
}
import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '../lib/supabase'
import { expireGameSelection, getGameRoom, initializeGame, selectGameCard, submitGameAnswer } from '../services/games'

export function useGamePreparation(gameId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient()
  const roomQueryKey = ['game-room', gameId, userId]
  const initializationQuery = useQuery({
    queryKey: ['game-initialization', gameId, userId],
    queryFn: async () => {
      await initializeGame(gameId!)
      return true
    },
    enabled: Boolean(gameId && userId),
    staleTime: Infinity,
    retry: false,
  })
  const roomQuery = useQuery({
    queryKey: roomQueryKey,
    queryFn: () => getGameRoom(gameId!, userId!),
    enabled: Boolean(gameId && userId && initializationQuery.isSuccess),
  })

  useEffect(() => {
    if (!gameId || !userId || !initializationQuery.isSuccess) {
      return
    }

    const channel = supabase
      .channel(`game-room-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: roomQueryKey })
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_questions',
        filter: `game_id=eq.${gameId}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: roomQueryKey })
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_answers',
        filter: `game_id=eq.${gameId}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: roomQueryKey })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void queryClient.invalidateQueries({ queryKey: roomQueryKey })
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [gameId, initializationQuery.isSuccess, queryClient, userId])

  const selectionMutation = useMutation({
    mutationFn: (gameQuestionId: string) => selectGameCard(gameId!, gameQuestionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomQueryKey }),
  })
  const answerMutation = useMutation({
    mutationFn: ({ gameQuestionId, answerId }: { gameQuestionId: string; answerId: string | null }) =>
      submitGameAnswer(gameId!, gameQuestionId, answerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomQueryKey }),
  })
  const selectionTimeoutMutation = useMutation({
    mutationFn: () => expireGameSelection(gameId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomQueryKey }),
  })

  return {
    ...roomQuery,
    data: roomQuery.data,
    error: initializationQuery.error ?? roomQuery.error,
    isError: initializationQuery.isError || roomQuery.isError,
    isLoading: initializationQuery.isLoading || roomQuery.isLoading,
    isFetching: initializationQuery.isFetching || roomQuery.isFetching,
    retry: () => {
      if (initializationQuery.isError) {
        void initializationQuery.refetch()
      } else {
        void roomQuery.refetch()
      }
    },
    selectCard: selectionMutation.mutateAsync,
    selectingCard: selectionMutation.isPending,
    selectionError: selectionMutation.error,
    submitAnswer: answerMutation.mutateAsync,
    submittingAnswer: answerMutation.isPending,
    expireSelection: selectionTimeoutMutation.mutateAsync,
  }
}
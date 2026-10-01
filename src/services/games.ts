import { supabase } from '../lib/supabase'

type QuestionCategory = 'lectura' | 'matematicas' | 'ingles' | 'cultura general'

type SelectedQuestion = {
  game_question_id: string
  question: string
  category: QuestionCategory
}

type ActiveOption = {
  answer_id: string
  answer: string
}

export type GameAnswer = {
  id: string
  game_question_id: string
  player_id: string
  answer_id: string | null
  is_correct: boolean
  response_time_ms: number
  answered_at: string
}

export type GameAnswerSubmission = {
  resolved: boolean
  is_correct?: boolean
  timed_out?: boolean
  response_time_ms?: number
  winner_id?: string
  tiebreak?: boolean
  next_question?: boolean
  finished?: boolean
}

export type GameRoom = {
  id: string
  status: string
  startedAt: string | null
  currentTurnId: string | null
  currentGameQuestionId: string | null
  winnerId: string | null
  playerOne: { id: string; username: string | null; avatarUrl: string | null; xp: number }
  playerTwo: { id: string; username: string | null; avatarUrl: string | null; xp: number }
  cards: Array<{
    id: string
    position: number
    selectedBy: string | null
    selectedAt: string | null
  }>
  selectedQuestion: {
    gameQuestionId: string
    question: string
    category: QuestionCategory
    selectedBy: string | null
    selectedAt: string
    answers: Array<{ id: string; answer: string }>
  } | null
  answers: GameAnswer[]
}

export async function initializeGame(gameId: string) {
  const { error } = await supabase.rpc('initialize_game_questions', {
    p_game_id: gameId,
  })

  if (error) {
    throw error
  }
}

export async function selectGameCard(gameId: string, gameQuestionId: string) {
  const { error } = await supabase.rpc('select_game_card', {
    p_game_id: gameId,
    p_game_question_id: gameQuestionId,
  })

  if (error) {
    throw error
  }
}

export async function submitGameAnswer(gameId: string, gameQuestionId: string, answerId: string | null) {
  const { data, error } = await supabase.rpc('submit_game_answer', {
    p_game_id: gameId,
    p_game_question_id: gameQuestionId,
    p_answer_id: answerId,
  })

  if (error) {
    throw error
  }

  return data as GameAnswerSubmission
}

export async function getGameRoom(gameId: string, userId: string): Promise<GameRoom> {
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, player_one_id, player_two_id, status, started_at, current_turn_id, current_game_question_id, winner_id')
    .eq('id', gameId)
    .maybeSingle()

  if (gameError) {
    throw gameError
  }
  if (!game) {
    throw new Error('No encontramos esta partida.')
  }
  if (![game.player_one_id, game.player_two_id].includes(userId)) {
    throw new Error('No tienes permiso para ver esta partida.')
  }
  if (game.status === 'activo' && !game.current_turn_id) {
    throw new Error('La partida todavía no tiene un turno inicial.')
  }

  const [
    { data: assignments, error: assignmentsError },
    { data: profiles, error: profilesError },
    { data: gameAnswers, error: gameAnswersError },
  ] = await Promise.all([
    supabase
      .from('game_questions')
      .select('id, position, selected_by, selected_at')
      .eq('game_id', gameId)
      .order('position'),
    supabase
      .from('profiles')
      .select('id, username, avatar_url, xp')
      .in('id', [game.player_one_id, game.player_two_id]),
    supabase
      .from('game_answers')
      .select('id, game_question_id, player_id, answer_id, is_correct, response_time_ms, answered_at')
      .eq('game_id', gameId)
      .order('answered_at'),
  ])

  if (assignmentsError) {
    throw assignmentsError
  }
  if (profilesError) {
    throw profilesError
  }
  if (gameAnswersError) {
    throw gameAnswersError
  }
  if (!assignments || assignments.length !== 6) {
    throw new Error('La partida no tiene sus seis cartas preparadas.')
  }

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const playerOne = profileById.get(game.player_one_id)
  const playerTwo = profileById.get(game.player_two_id)

  if (!playerOne || !playerTwo) {
    throw new Error('No pudimos cargar los perfiles de ambos jugadores.')
  }

  let selectedQuestion: GameRoom['selectedQuestion'] = null
  if (game.current_game_question_id) {
    const { data, error } = await supabase.rpc('get_selected_game_question', {
      p_game_id: gameId,
    })

    if (error) {
      throw error
    }

    const revealedQuestion = (data as SelectedQuestion[] | null)?.[0]
    if (revealedQuestion && revealedQuestion.game_question_id === game.current_game_question_id) {
      const selectedCard = assignments.find((assignment) => assignment.id === game.current_game_question_id)
      if (!selectedCard?.selected_at) {
        throw new Error('La pregunta activa no tiene un inicio de oportunidad válido.')
      }

      const { data: optionRows, error: optionsError } = await supabase.rpc('get_active_game_answers', {
        p_game_id: gameId,
      })

      if (optionsError) {
        throw optionsError
      }

      selectedQuestion = {
        gameQuestionId: revealedQuestion.game_question_id,
        question: revealedQuestion.question,
        category: revealedQuestion.category,
        selectedBy: selectedCard.selected_by,
        selectedAt: selectedCard.selected_at,
        answers: ((optionRows as ActiveOption[] | null) ?? []).map((option) => ({
          id: option.answer_id,
          answer: option.answer,
        })),
      }
    }
  }

  return {
    id: game.id,
    status: game.status,
    startedAt: game.started_at,
    currentTurnId: game.current_turn_id,
    currentGameQuestionId: game.current_game_question_id,
    winnerId: game.winner_id,
    playerOne: {
      id: playerOne.id,
      username: playerOne.username,
      avatarUrl: playerOne.avatar_url,
      xp: playerOne.xp,
    },
    playerTwo: {
      id: playerTwo.id,
      username: playerTwo.username,
      avatarUrl: playerTwo.avatar_url,
      xp: playerTwo.xp,
    },
    cards: assignments.map((assignment) => ({
      id: assignment.id,
      position: assignment.position,
      selectedBy: assignment.selected_by,
      selectedAt: assignment.selected_at,
    })),
    selectedQuestion,
    answers: (gameAnswers ?? []) as GameAnswer[],
  }
}
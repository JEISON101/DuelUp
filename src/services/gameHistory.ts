import { supabase } from '../lib/supabase'

export const WINNER_XP_REWARD = 25

export type GameHistoryEntry = {
  id: string
  finishedAt: string
  won: boolean
  xpEarned: number
  opponent: { id: string; username: string | null; avatarUrl: string | null }
  myAnswers: { correct: number; incorrect: number }
  opponentAnswers: { correct: number; incorrect: number }
}

type GameRow = {
  id: string
  player_one_id: string
  player_two_id: string
  winner_id: string | null
  finished_at: string | null
}

type ProfileRow = { id: string; username: string | null; avatar_url: string | null }
type AnswerRow = {
  game_id: string
  game_question_id: string
  player_id: string
  is_correct: boolean
  answered_at: string
}

export async function getGameHistory(userId: string): Promise<GameHistoryEntry[]> {
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('id, player_one_id, player_two_id, winner_id, finished_at')
    .or(`player_one_id.eq.${userId},player_two_id.eq.${userId}`)
    .eq('status', 'finalizado')
    .order('finished_at', { ascending: false })
    .limit(50)

  if (gamesError) throw gamesError
  if (!games?.length) return []

  const gameRows = games as GameRow[]
  const participantIds = [...new Set(gameRows.flatMap((game) => [game.player_one_id, game.player_two_id]))]
  const gameIds = gameRows.map((game) => game.id)
  const [profilesResult, answersResult] = await Promise.all([
    supabase.from('profiles').select('id, username, avatar_url').in('id', participantIds),
    supabase
      .from('game_answers')
      .select('game_id, game_question_id, player_id, is_correct, answered_at')
      .in('game_id', gameIds)
      .order('answered_at', { ascending: true }),
  ])

  if (profilesResult.error) throw profilesResult.error
  if (answersResult.error) throw answersResult.error

  const profilesById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  )
  const answersByGame = new Map<string, AnswerRow[]>()
  ;((answersResult.data ?? []) as AnswerRow[]).forEach((answer) => {
    const gameAnswers = answersByGame.get(answer.game_id) ?? []
    gameAnswers.push(answer)
    answersByGame.set(answer.game_id, gameAnswers)
  })

  return gameRows.flatMap((game) => {
    const opponentId = game.player_one_id === userId ? game.player_two_id : game.player_one_id
    const opponent = profilesById.get(opponentId)
    if (!opponent || !game.finished_at) return []

    const firstAnswerByCard = new Map<string, AnswerRow>()
    ;(answersByGame.get(game.id) ?? []).forEach((answer) => {
      if (!firstAnswerByCard.has(answer.game_question_id)) {
        firstAnswerByCard.set(answer.game_question_id, answer)
      }
    })
    const normalAnswers = [...firstAnswerByCard.values()]
    const tally = (playerId: string) => {
      const answers = normalAnswers.filter((answer) => answer.player_id === playerId)
      return {
        correct: answers.filter((answer) => answer.is_correct).length,
        incorrect: answers.filter((answer) => !answer.is_correct).length,
      }
    }
    const won = game.winner_id === userId

    return [{
      id: game.id,
      finishedAt: game.finished_at,
      won,
      xpEarned: won ? WINNER_XP_REWARD : 0,
      opponent: { id: opponent.id, username: opponent.username, avatarUrl: opponent.avatar_url },
      myAnswers: tally(userId),
      opponentAnswers: tally(opponentId),
    }]
  })
}
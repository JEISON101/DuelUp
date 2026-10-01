import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Clock3, Home, RotateCw, Sparkles, Swords, Trophy, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import jokerImage from '../assets/joker.jpg'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useGamePreparation } from '../hooks/useGamePreparation'
import type { GameAnswer, GameAnswerSubmission, GameRoom } from '../services/games'
import './Game.css'

function getNormalScores(game: GameRoom) {
  const firstAnswers = new Map<string, GameRoom['answers'][number]>()
  game.answers
    .slice()
    .sort((first, second) => Date.parse(first.answered_at) - Date.parse(second.answered_at))
    .forEach((answer) => {
      if (!firstAnswers.has(answer.game_question_id)) firstAnswers.set(answer.game_question_id, answer)
    })

  return [game.playerOne, game.playerTwo].map((player) => {
    const playerAnswers = [...firstAnswers.values()].filter((answer) => answer.player_id === player.id)
    return {
      player,
      correct: playerAnswers.filter((answer) => answer.is_correct).length,
      incorrect: playerAnswers.filter((answer) => answer.answer_id !== null && !answer.is_correct).length,
      unanswered: playerAnswers.filter((answer) => answer.answer_id === null).length,
    }
  })
}

const Game = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const gameQuery = useGamePreparation(id, user?.id)
  const [selectionPending, setSelectionPending] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const timeoutAttempts = useRef(new Set<string>())
  const activeQuestion: GameRoom['selectedQuestion'] | undefined = gameQuery.data?.selectedQuestion

  useEffect(() => {
    if (!activeQuestion || !id) {
      setRemainingSeconds(null)
      return
    }

    const roundKey = `${id}:${activeQuestion.gameQuestionId}:${activeQuestion.selectedAt}`
    const durationMs = activeQuestion.selectedBy === null ? 10_000 : 30_000
    const deadline = Date.parse(activeQuestion.selectedAt) + durationMs
    const updateTimer = () => {
      const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemainingSeconds(secondsLeft)
      if (secondsLeft === 0 && !timeoutAttempts.current.has(roundKey)) {
        timeoutAttempts.current.add(roundKey)
        void gameQuery.submitAnswer({ gameQuestionId: activeQuestion.gameQuestionId, answerId: null }).catch(() => {})
      }
    }

    updateTimer()
    const interval = window.setInterval(updateTimer, 250)
    return () => window.clearInterval(interval)
  }, [activeQuestion, gameQuery.submitAnswer, id])

  if (gameQuery.isLoading) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-midnight px-4 text-white'>
        <Spinner size='lg' label='Preparando la partida...' />
      </main>
    )
  }

  if (gameQuery.isError || !gameQuery.data) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-midnight px-4 py-8 text-white'>
        <Card className='w-full max-w-lg space-y-5'>
          <div>
            <p className='text-sm uppercase text-purple'>DuelUP</p>
            <h1 className='mt-2 text-2xl font-bold'>No pudimos preparar la partida</h1>
            <p role='alert' className='mt-3 text-sm text-white-muted'>
              {gameQuery.error instanceof Error
                ? gameQuery.error.message
                : 'Ocurrió un error al cargar la partida.'}
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button
              leftIcon={<RotateCw size={16} />}
              isLoading={gameQuery.isFetching}
              onClick={gameQuery.retry}
            >
              Reintentar
            </Button>
            <Button variant='ghost' leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/app/home')}>
              Volver al inicio
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  const game = gameQuery.data
  if (game.status === 'finalizado') {
    const scores = getNormalScores(game)
    const winner = [game.playerOne, game.playerTwo].find((player) => player.id === game.winnerId)

    return (
      <main className='game-room-shell min-h-screen px-4 py-8 text-white sm:px-6'>
        <div className='game-room-content mx-auto max-w-4xl space-y-6'>
          <header className='text-center'>
            <div className='game-room-mark mx-auto mb-4'><Trophy size={22} /></div>
            <p className='game-room-kicker'>DuelUP <span>/</span> Resultado final</p>
            <h1 className='mt-2 text-3xl font-bold sm:text-4xl'>{winner ? `${winner.username || 'Jugador'} gana` : 'Partida finalizada'}</h1>
            {winner ? <p className='mt-2 text-gold'>+25 XP</p> : null}
          </header>
          <section className='game-scorebar game-results-grid'>
            {scores.map(({ player, correct, incorrect, unanswered }) => (
              <article key={player.id} className='game-result-player'>
                <p className='font-semibold'>{player.username || 'Jugador'}</p>
                <p className='mt-3 text-3xl font-bold text-gold'>{correct}<span className='ml-2 text-sm font-normal text-white-muted'>puntos</span></p>
                <p className='mt-2 text-sm text-white-muted'>{correct} correctas · {incorrect} incorrectas · {unanswered} sin respuesta</p>
              </article>
            ))}
          </section>
          {game.answers.length > 6 ? <p className='text-center text-sm text-white-muted'>El duelo incluyó desempate.</p> : null}
          <div className='flex flex-wrap justify-center gap-3'>
            <Button leftIcon={<Home size={16} />} onClick={() => navigate('/app/home')}>Volver a Home</Button>
            <Button variant='ghost' leftIcon={<Swords size={16} />} onClick={() => navigate('/app/home')}>Retar a otro jugador</Button>
          </div>
        </div>
      </main>
    )
  }

  //const currentPlayer = [game.playerOne, game.playerTwo].find((player) => player.id === game.currentTurnId)
  const isMyTurn = game.currentTurnId === user?.id
  const hasRevealedCard = game.currentGameQuestionId !== null
  const canSelectCard = game.status === 'activo' && isMyTurn && !hasRevealedCard
  const activeQuestionResponse = activeQuestion
    ? game.answers.find((answer: GameAnswer) =>
        answer.game_question_id === activeQuestion.gameQuestionId &&
        answer.player_id === user?.id &&
        Date.parse(answer.answered_at) >= Date.parse(activeQuestion.selectedAt),
      )
    : null
  const canRespond = Boolean(
    activeQuestion && remainingSeconds !== 0 && !activeQuestionResponse &&
    (activeQuestion.selectedBy === null || activeQuestion.selectedBy !== user?.id),
  )

  const handleSelectCard = async (gameQuestionId: string) => {
    setSelectionPending(true)
    try {
      await gameQuery.selectCard(gameQuestionId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos revelar esa carta.')
    } finally {
      setSelectionPending(false)
    }
  }

  const handleAnswer = async (answerId: string) => {
    if (!activeQuestion) return
    try {
      const result = await gameQuery.submitAnswer({ gameQuestionId: activeQuestion.gameQuestionId, answerId }) as GameAnswerSubmission
      if (result.timed_out) toast.info('Se agotó el tiempo para responder.')
      else if (result.is_correct) toast.success('¡Bien!')
      else if (result.resolved) toast.error('Respuesta incorrecta.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos registrar tu respuesta.')
    }
  }

  const latestAnswer = game.answers.at(-1)
  const latestAnswerPlayer = latestAnswer
    ? [game.playerOne, game.playerTwo].find((player) => player.id === latestAnswer.player_id)
    : null

  return (
    <main className='game-room-shell min-h-screen px-4 py-6 text-white sm:px-6 sm:py-9'>
      <div className='game-room-content mx-auto max-w-6xl'>
        <header className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='game-room-mark' aria-hidden='true'><Swords size={21} /></div>
            <div>
              <p className='game-room-kicker'>DuelUP <span>/</span> Sala de duelo</p>
              <h1 className='mt-1 text-2xl font-bold sm:text-3xl'>La mesa está lista</h1>
            </div>
          </div>
          <Button variant='ghost' leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/app/home')}>
            Salir a inicio
          </Button>
        </header>

        <section className='game-scorebar flex-col cols-2 sm:cols-1 mb-7' aria-label='Estado de la partida'>
          {[game.playerOne, game.playerTwo].map((player, index) => {
            const isCurrentPlayer = player.id === game.currentTurnId
            const playerName = player.username || `Jugador ${index + 1}`

            return (
              <div key={player.id} className={`game-player ${isCurrentPlayer ? 'game-player-active' : ''}`}>
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt='' className='game-player-avatar' />
                ) : (
                  <span className='game-player-avatar game-player-initial' aria-hidden='true'>{playerName[0].toUpperCase()}</span>
                )}
                <div className='min-w-0'>
                  <p className='truncate font-semibold'>{playerName}</p>
                  <p className='game-player-label'>{isCurrentPlayer ? 'Turno actual' : 'En la mesa'}</p>
                </div>
                {isCurrentPlayer ? <span className='game-turn-dot' aria-label='Tiene el turno' /> : null}
              </div>
            )
          })}
        </section>

        <section className='game-table' aria-labelledby='cards-title'>
          <div className='mb-6 flex flex-wrap items-end justify-between gap-3'>
            <div>
              <p className='game-room-kicker text-gold'>Ronda inicial <span>/</span> 6 cartas</p>
              <h2 id='cards-title' className='mt-1 text-xl font-semibold sm:text-2xl'>Elige una carta</h2>
            </div>
            <div className='game-table-count'><Sparkles size={15} /> 6 preparadas</div>
          </div>

          <div className='game-card-grid'>
            {game.cards.map((card: GameRoom['cards'][number]) => {
              const isRevealed = card.id === game.currentGameQuestionId
              const isUnavailable = !canSelectCard || card.selectedAt !== null || selectionPending

              return (
                <button
                  key={card.id}
                  type='button'
                  className={`game-card ${isRevealed ? 'game-card-revealed' : ''}`}
                  disabled={isUnavailable}
                  aria-label={isRevealed ? `Carta ${card.position}, pregunta revelada` : `Seleccionar carta ${card.position}`}
                  aria-pressed={isRevealed}
                  onClick={() => void handleSelectCard(card.id)}
                >
                  {isRevealed && game.selectedQuestion ? (
                    <span className='game-card-face'>
                      <span className='game-card-face-top'>
                        <span>Pregunta {card.position}</span>
                        <Check size={16} />
                      </span>
                      <span className='game-card-category'>{game.selectedQuestion.category}</span>
                      <span className='game-card-question'>{game.selectedQuestion.question}</span>
                      <span className='game-card-face-bottom'>Revelada en la mesa</span>
                    </span>
                  ) : isRevealed ? (
                    <span className='game-card-face game-card-loading'>Revelando pregunta...</span>
                  ) : (
                    <span className='game-card-back'>
                      <img className='game-card-art' src={jokerImage} alt='' />
                      <span className='game-card-index'>{String(card.position).padStart(2, '0')}</span>
                      <span className='game-card-brand p-4'>DUEL
                        <span>UP</span>
                      </span>
                      <span className='game-card-prompt'>
                        {canSelectCard ? 'Toca para revelar' : card.selectedAt ? 'En mesa' : 'Boca abajo'}
                      </span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {activeQuestion ? (
            <section className='game-answer-panel' aria-label='Opciones de respuesta'>
              <div className='game-answer-heading'>
                <div>
                  <p className='game-room-kicker text-gold'>{activeQuestion.selectedBy === null ? 'Desempate' : 'Responde ahora'}</p>
                  <h3 className='mt-1 text-lg font-semibold'>
                    {canRespond ? 'Elige una respuesta' : activeQuestionResponse ? 'Respuesta registrada' : 'Esperando al rival'}
                  </h3>
                </div>
                <span className={`game-countdown ${remainingSeconds !== null && remainingSeconds <= 5 ? 'game-countdown-urgent' : ''}`}>
                  <Clock3 size={16} /> {remainingSeconds ?? '--'}s
                </span>
              </div>
              {canRespond ? (
                <div className='game-answer-options'>
                  {activeQuestion.answers.map((answer: { id: string; answer: string }, index: number) => (
                    <Button
                      key={answer.id}
                      variant='ghost'
                      disabled={gameQuery.submittingAnswer}
                      isLoading={gameQuery.submittingAnswer}
                      onClick={() => void handleAnswer(answer.id)}
                    >
                      <span className='game-answer-index'>{String.fromCharCode(65 + index)}</span>
                      {answer.answer}
                    </Button>
                  ))}
                </div>
              ) : activeQuestionResponse ? (
                <p className='mt-3 text-sm text-white-muted'>Tu respuesta quedó registrada; espera al otro jugador.</p>
              ) : (
                <p className='mt-3 text-sm text-white-muted'>El rival tiene la oportunidad de responder.</p>
              )}
              {activeQuestion.selectedBy === null ? (
                <div className='game-tiebreak-responses'>
                  {game.answers
                    .filter((answer: GameAnswer) => answer.game_question_id === activeQuestion.gameQuestionId && Date.parse(answer.answered_at) >= Date.parse(activeQuestion.selectedAt))
                    .map((answer: GameAnswer) => {
                      const responder = [game.playerOne, game.playerTwo].find((player) => player.id === answer.player_id)
                      return (
                        <p key={answer.id} className='text-sm text-white-muted'>
                          <span className={answer.is_correct ? 'text-green-300' : 'text-red-300'}>
                            {answer.answer_id === null ? 'Sin respuesta' : answer.is_correct ? '✓ Bien' : '✕ Incorrecto'}
                          </span>
                          {' · '}{responder?.username || 'Jugador'} · {answer.response_time_ms / 1000}s
                        </p>
                      )
                    })}
                </div>
              ) : null}
            </section>
          ) : null}

          <p className='game-table-footnote'>
            {hasRevealedCard
              ? 'La selección quedó sincronizada para ambos jugadores.'
              : isMyTurn
                ? 'Tu elección revelará la pregunta para los dos jugadores.'
                : 'Las cartas permanecen ocultas mientras esperas el turno.'}
          </p>
        </section>

        {!hasRevealedCard && latestAnswer ? (
          <section className='game-last-result' role='status'>
            <span className={`game-result-icon ${latestAnswer.answer_id === null ? 'game-result-timeout' : latestAnswer.is_correct ? 'game-result-correct' : 'game-result-incorrect'}`}>
              {latestAnswer.answer_id === null ? <Clock3 size={18} /> : latestAnswer.is_correct ? <Check size={18} /> : <X size={18} />}
            </span>
            <div>
              <p className='font-semibold'>{latestAnswer.answer_id === null ? 'Sin respuesta' : latestAnswer.is_correct ? 'Bien' : 'Incorrecto'}</p>
              <p className='text-xs text-white-muted'>{latestAnswerPlayer?.username || 'Jugador'} · {latestAnswer.response_time_ms / 1000}s</p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default Game

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Clock3, History, Swords, Trophy, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getGameHistory } from '../services/gameHistory'

const Games = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const historyQuery = useQuery({
    queryKey: ['game-history', user?.id],
    queryFn: () => getGameHistory(user!.id),
    enabled: Boolean(user?.id),
  })

 const eyebrowClass = 'text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-100/[0.52]'
const iconBoxClass =
  'grid h-[42px] w-[42px] flex-none place-items-center rounded-[10px] border border-[rgba(245,197,66,0.32)] bg-[rgba(245,197,66,0.08)] text-[#f5c542]'

return (
  <main className='games-page min-h-screen px-4 py-7 text-white sm:px-6 sm:py-10'>
    <div className='mx-auto max-w-5xl space-y-7'>
      <header className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6'>
        <div className='flex items-center gap-3'>
          <span className={iconBoxClass}><History size={20} /></span>
          <div>
            <p className={eyebrowClass}>DuelUP / Historial</p>
            <h1 className='mt-1 text-3xl font-bold'>Tus partidas</h1>
          </div>
        </div>
        <Button variant='ghost' leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/app/home')}>
          Volver a Home
        </Button>
      </header>

      <section aria-labelledby='history-title' className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <p className={eyebrowClass}>Resultados</p>
            <h2 id='history-title' className='mt-1 text-xl font-semibold'>Partidas finalizadas</h2>
          </div>
          {historyQuery.data?.length ? <span className='text-sm text-white-muted'>{historyQuery.data.length} recientes</span> : null}
        </div>

        {historyQuery.isLoading ? (
          <div className='flex justify-center py-14'><Spinner size='lg' label='Cargando partidas...' /></div>
        ) : historyQuery.isError ? (
          <Card className='border-red-400/20'>
            <p className='text-red-200'>No pudimos cargar el historial.</p>
            <p className='mt-1 text-sm text-white-muted'>Revisa los permisos de lectura de partidas, perfiles y respuestas.</p>
            <Button className='mt-4' variant='ghost' onClick={() => void historyQuery.refetch()}>Reintentar</Button>
          </Card>
        ) : historyQuery.data?.length ? (
          <div className='grid gap-[0.65rem]'>
            {historyQuery.data.map((match) => {
              const opponentName = match.opponent.username || 'Jugador'
              return (
                <article
                  key={match.id}
                  className={`grid grid-cols-[minmax(180px,1.3fr)_minmax(100px,0.7fr)_minmax(210px,1.25fr)_minmax(74px,0.4fr)_auto] items-center gap-4 rounded-[10px] border border-l-[3px] border-white/[0.09] bg-[linear-gradient(105deg,rgba(18,26,47,0.94),rgba(11,17,33,0.9))] px-4 py-[0.85rem] max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-[0.8rem] ${
                    match.won ? 'border-l-[#42d39b]' : 'border-l-[#ff7373]'
                  }`}
                >
                  <div className='flex min-w-0 items-center gap-3 max-[760px]:col-start-1'>
                    {match.opponent.avatarUrl ? (
                      <img
                        className='grid h-[42px] w-[42px] flex-none place-items-center rounded-full border border-white/[0.17] object-cover'
                        src={match.opponent.avatarUrl}
                        alt=''
                      />
                    ) : (
                      <span
                        className='grid h-[42px] w-[42px] flex-none place-items-center rounded-full border border-white/[0.17] bg-[linear-gradient(145deg,#2774ef,#7d4dec)] font-bold'
                        aria-hidden='true'
                      >
                        {opponentName[0].toUpperCase()}
                      </span>
                    )}
                    <div className='min-w-0'>
                      <p className='truncate font-semibold'>vs. {opponentName}</p>
                      <p className='mt-1 flex items-center gap-1.5 text-xs text-white-muted'>
                        <Clock3 size={13} />
                        {new Date(match.finishedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-[0.4rem] text-[0.78rem] font-bold max-[760px]:col-start-2 max-[760px]:row-start-1 max-[760px]:justify-self-end ${
                      match.won ? 'text-[#58e0aa]' : 'text-[#ff8585]'
                    }`}
                  >
                    {match.won ? <Trophy size={15} /> : <X size={15} />}
                    {match.won ? 'Victoria' : 'Derrota'}
                  </div>

                  <div
                    className='grid gap-[0.32rem] text-[0.72rem] tabular-nums text-slate-100/[0.66] max-[760px]:col-start-1'
                    aria-label='Respuestas correctas e incorrectas'
                  >
                    <div className='flex items-center gap-[0.55rem]'>
                      <span className='w-[62px] flex-none truncate font-semibold text-slate-100'>Tú</span>
                      <span className='inline-flex items-center gap-[0.18rem] text-[#58e0aa]'><Check size={14} /> {match.myAnswers.correct}</span>
                      <span className='inline-flex items-center gap-[0.18rem] text-[#ff8585]'><X size={14} /> {match.myAnswers.incorrect}</span>
                    </div>
                    <div className='flex items-center gap-[0.55rem]'>
                      <span className='w-[62px] flex-none truncate font-semibold text-slate-100/[0.55]'>{opponentName}</span>
                      <span className='inline-flex items-center gap-[0.18rem] text-[#58e0aa]'><Check size={14} /> {match.opponentAnswers.correct}</span>
                      <span className='inline-flex items-center gap-[0.18rem] text-[#ff8585]'><X size={14} /> {match.opponentAnswers.incorrect}</span>
                    </div>
                  </div>

                  <div className='grid gap-[0.1rem] text-[0.68rem] uppercase text-slate-100/45 max-[760px]:col-start-2 max-[760px]:row-start-2 max-[760px]:justify-self-end max-[760px]:text-right'>
                    <span>XP</span>
                    <strong
                      className={`text-[0.95rem] tabular-nums ${
                        match.xpEarned ? 'text-[#f5c542]' : 'text-slate-100/65'
                      }`}
                    >
                      {match.xpEarned ? `+${match.xpEarned}` : '+0'}
                    </strong>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <Card className='flex min-h-[250px] flex-col items-center justify-center text-center'>
            <span className={iconBoxClass}><Swords size={22} /></span>
            <h3 className='mt-4 font-semibold'>Todavía no tienes partidas finalizadas</h3>
            <p className='mt-1 text-sm text-white-muted'>Cuando completes un duelo, el resultado aparecerá aquí.</p>
            <Button className='mt-5' onClick={() => navigate('/app/home')}>Buscar rival</Button>
          </Card>
        )}
      </section>
    </div>
  </main>
)
}

export default Games

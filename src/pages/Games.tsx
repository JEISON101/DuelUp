import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const Games = () => {
  return (
    <div className='min-h-screen bg-midnight px-4 py-8 text-white'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.2em] text-purple'>DuelUP</p>
            <h1 className='mt-2 text-3xl font-bold'>Partidas</h1>
          </div>
        </div>

        <Card>
          <p className='text-white-muted'>La pantalla de partidas se implementará en la siguiente fase.</p>
          <div className='mt-4'>
            <Button variant='primary'>Crear partida</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Games

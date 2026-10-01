import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const { user, profile } = useAuth()

  return (
    <div className='min-h-screen bg-midnight px-4 py-8 text-white'>
      <div className='mx-auto max-w-4xl'>
        <Card>
          <p className='text-sm uppercase tracking-[0.2em] text-purple'>Perfil</p>
          <h1 className='mt-3 text-3xl font-bold'>{profile?.username ?? 'Jugador'}</h1>
          <div className='mt-6 space-y-2 text-white-muted'>
            <p>Email: {user?.email ?? 'Sin email disponible'}</p>
            <p>XP: {profile?.xp ?? 0}</p>
            <p>ID: {user?.id ?? 'Sin id'}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Profile

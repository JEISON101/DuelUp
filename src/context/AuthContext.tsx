import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { queryClient } from '../lib/queryClient'
import { supabase } from '../lib/supabase'
import { getCurrentProfile, type Profile } from '../services/profile'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  onlinePlayers: OnlinePlayer[]
  loading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  setSessionState: (session: Session | null) => void
}

export interface OnlinePlayer {
  userId: string
  username: string | null
  avatarUrl: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([])
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null)
      return
    }

    try {
      const nextProfile = await getCurrentProfile()
      setProfile(nextProfile)
    } catch (error) {
      console.error('Error loading profile during auth sync:', error)
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const currentUser = user ?? session?.user ?? null
    if (!currentUser) {
      setProfile(null)
      return
    }

    try {
      const nextProfile = await getCurrentProfile()
      setProfile(nextProfile)
    } catch (error) {
      console.error('Error refreshing profile:', error)
      setProfile(null)
    }
  }, [session, user])

  const setSessionState = useCallback((nextSession: Session | null) => {
    setSession(nextSession)
    setUser(nextSession?.user ?? null)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!isMounted) {
          return
        }

        setSessionState(currentSession)
        await loadProfile(currentSession?.user ?? null)
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setSessionState(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSessionState(nextSession)
      await loadProfile(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile, setSessionState])

  useEffect(() => {
    if (!user) {
      setOnlinePlayers([])
      return
    }

    const channel = supabase.channel('duelup-online-users', {
      config: { presence: { key: user.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const players = Object.values(channel.presenceState())
          .flat()
          .map((presence): OnlinePlayer | null => {
            const state = presence as Record<string, unknown>
            const userId = String(state.user_id ?? '')

            if (!userId) {
              return null
            }

            return {
              userId,
              username: typeof state.username === 'string' ? state.username : null,
              avatarUrl: typeof state.avatar_url === 'string' ? state.avatar_url : null,
            }
          })
          .filter((player): player is OnlinePlayer => player !== null)

        setOnlinePlayers([...new Map(players.map((player) => [player.userId, player])).values()])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            username: profile?.username ?? null,
            avatar_url: profile?.avatar_url ?? null,
          })
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [profile?.avatar_url, profile?.username, user])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    setSessionState(null)
    setProfile(null)
    setLoading(false)
  }, [setSessionState])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      onlinePlayers,
      loading,
      isAuthenticated: Boolean(user && session),
      refreshProfile,
      signOut,
      setSessionState,
    }),
    [loading, onlinePlayers, profile, refreshProfile, session, setSessionState, signOut, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

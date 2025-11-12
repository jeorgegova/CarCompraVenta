import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [welcomeShown, setWelcomeShown] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const [profile, setProfile] = useState(null)
  const [userName, setUserName] = useState('')
  const roleFetchInFlightRef = useRef(false)

  const ensureSessionReady = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) return session
    await supabase.auth.refreshSession()
    return await new Promise((resolve) => {
      const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          listener.subscription.unsubscribe()
          resolve(s)
        }
      })
      setTimeout(() => {
        listener.subscription.unsubscribe()
        resolve(null)
      }, 2000)
    })
  }
  const queryLockRef = useRef(Promise.resolve())
  const runQuery = async (executor) => {
    const chain = queryLockRef.current.then(async () => {
      await ensureSessionReady()
      return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('supabase_timeout')), 8000)
        executor(supabase)
          .then((res) => { clearTimeout(timer); resolve(res) })
          .catch((err) => { clearTimeout(timer); reject(err) })
      })
    })
    queryLockRef.current = chain.catch(() => { })
    return chain
  }

  const mountedRef = useRef(true)
  const subscriptionRef = useRef(null)
  const initAttemptedRef = useRef(false)

  // Limpiar notificación
  const clearNotification = () => setNotification(null)

  const showWelcomeNotification = (name) => {
    setNotification({
      message: `¡Bienvenido de vuelta, ${name}!`,
      type: 'success',
      duration: 5000,
    })
  }

  // Obtener rol del usuario
  const fetchUserRole = async (userId) => {
    console.log('fetchUserRole called with userId:', userId)
    if (!mountedRef.current) return
    if (!userId) return
    if (roleFetchInFlightRef.current) return
    roleFetchInFlightRef.current = true
    setRoleLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('id', userId)
        .maybeSingle()
      console.log('fetchUserRole: initial query result - data:', data, 'error:', error)

      if (!mountedRef.current) return

      if (!data) {
        console.log('fetchUserRole: no profile data found for userId:', userId)
        setUserRole(null)
        setProfile(null)
        setUserName('')
        return
      }

      console.log('fetchUserRole: profile data found - role:', data.role, 'fullName:', `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim())
      setUserRole(data.role)
      setProfile(data)
      const fullName = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim()
      setUserName(fullName || '')

      // Guardar datos del usuario en localStorage
      const userData = {
        userRole: data.role,
        profile: data,
        userName: fullName || ''
      }
      localStorage.setItem('userData', JSON.stringify(userData))

      // Mostrar bienvenida solo una vez
      if (!welcomeShown && data.first_name) {
        showWelcomeNotification(fullName)
        setWelcomeShown(true)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      if (mountedRef.current) setRoleLoading(false)
      roleFetchInFlightRef.current = false
    }
  }

  // Inicialización única
  useEffect(() => {
    if (initAttemptedRef.current) return
    initAttemptedRef.current = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mountedRef.current) return

        if (error) {
          console.error('Error getting session:', error)
          setSessionError(true)
        } else if (session?.user) {
          setUser(session.user)
          setUserName(session.user.email ?? '')

          // Intentar cargar datos desde localStorage primero para UI inmediata
          const storedData = localStorage.getItem('userData')
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData)
              setUserRole(parsedData.userRole)
              setProfile(parsedData.profile)
              setUserName(parsedData.userName || (session.user.email ?? ''))
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError)
            }
          }

          // Obtener datos frescos de la base de datos en segundo plano
          fetchUserRole(session.user.id).catch(error => {
            console.error('Error fetching fresh user data:', error)
          })
        } else {
          // Limpiar datos si no hay sesión
          setUser(null)
          setUserRole(null)
          setProfile(null)
          setUserName('')
          localStorage.removeItem('userData')
        }
      } catch (err) {
        console.error('Unexpected auth init error:', err)
        setSessionError(true)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación (una sola vez)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        console.log('Auth event:', event)

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null)
          setUserRole(null)
          setWelcomeShown(false)
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          if (currentUser) {
            setUserName(currentUser.email ?? '')
            // Fetch user role in background without blocking
            fetchUserRole(currentUser.id).catch(error => {
              console.error('Error fetching user role on auth change:', error)
            })
          }
        }
      }
    )

    subscriptionRef.current = listener

    // Cleanup
    return () => {
      mountedRef.current = false
      subscriptionRef.current?.subscription?.unsubscribe()

    }
  }, []) // ← Solo una vez

  // === Acciones de autenticación ===

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setSessionError(false)
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, extraData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          ...extraData,
          created_at: new Date().toISOString(),
        })
      }

      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setWelcomeShown(false)
      setUser(null)
      setUserRole(null)
      setProfile(null)
      setUserName('')
      localStorage.removeItem('userData')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      return { success: !error, session: data.session }
    } catch (error) {
      console.error('Manual refresh error:', error)
      return { success: false }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userRole,
        roleLoading,
        profile,
        userName,
        runQuery,
        ensureSessionReady,
        signIn,
        signUp,
        signOut,
        notification,
        clearNotification,
        showWelcomeNotification,
        sessionError,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

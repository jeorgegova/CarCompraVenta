import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      // 1️⃣ Intentar cargar sesión inicial
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error) console.error('Error obteniendo sesión:', error)
      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false)
    }

    initAuth()

    // 2️⃣ Escuchar cambios de sesión en tiempo real
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 3️⃣ Limpieza al desmontar
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 🔹 Iniciar sesión
  const signIn = async (email, password) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      setLoading(false)
      throw error
    }
    setUser(data.user)
    setLoading(false)
    return data
  }

  // 🔹 Registrar usuario
  const signUp = async (email, password, extraData = {}) => {
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
  }

  // 🔹 Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // 🔹 Notificaciones simples
  const clearNotification = () => setNotification(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        notification,
        clearNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

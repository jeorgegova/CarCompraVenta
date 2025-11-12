import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const gateOn = (typeof localStorage !== 'undefined' && localStorage.getItem('SUPA_GATE') === 'on') || import.meta.env.VITE_SUPABASE_GATE === 'on'
if (gateOn && typeof window !== 'undefined') {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const originalFetch = window.fetch
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url
    if (url && typeof url === 'string' && supabaseUrl && url.startsWith(supabaseUrl)) {
      const u = new URL(url)
      const isAuth = u.pathname.includes('/auth/')
      if (isAuth) return originalFetch(input, init)
      const allowRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('SUPA_ALLOW') || '' : ''
      const allow = allowRaw.split(',').map(s => s.trim()).filter(Boolean)
      const parts = u.pathname.split('/')
      const last = parts[parts.length - 1]
      const table = last
      const allowed = allow.includes(table)
      if (!allowed) {
        console.warn('[SUPA_GATE] blocked', table, u.pathname)
        return new Promise(() => {})
      }
      console.info('[SUPA_GATE] allowed', table)
    }
    return originalFetch(input, init)
  }
}

createRoot(document.getElementById('root')).render(
  <App />
)

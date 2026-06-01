'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError('אימייל או סיסמה שגויים')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userData?.role === 'admin') {
        router.push('/admin/users')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md">
        <div className="bg-bg-card border border-bg-hover rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Samilator</h1>
            <p className="text-text-secondary text-sm">מערכת אימון מכירות</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                סיסמה
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl px-4 py-3 text-accent-red text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'מתחבר...' : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

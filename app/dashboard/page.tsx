'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [skillName, setSkillName] = useState('')
  const [skillId, setSkillId] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // Check role from metadata first (fast), fallback to DB
      const metaRole = user.user_metadata?.role
      if (metaRole === 'admin') {
        router.push('/admin/users')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/admin/users')
        return
      }

      const { data: assignment } = await supabase
        .from('skill_assignments')
        .select('skill_id, skill_name')
        .eq('user_id', user.id)
        .single()

      setUserName(profile?.name || '')
      setSkillName(assignment?.skill_name || '')
      setSkillId(assignment?.skill_id || '')
    }
    load()
  }, [router])

  async function startSession() {
    if (!skillId) return
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill_id: skillId, skill_name: skillName }),
    })
    const data = await res.json()
    if (data.session_id) router.push(`/chat/${data.session_id}`)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-2">שלום, {userName} 👋</h1>
        <p className="text-text-secondary mb-8">מוכן לאימון?</p>

        {skillName ? (
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 mb-6">
            <p className="text-text-secondary text-sm mb-1">הסקיל שלך</p>
            <p className="text-text-primary text-xl font-bold mb-6">{skillName}</p>
            <button onClick={startSession}
              className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity text-lg">
              🚀 התחל שיחה
            </button>
          </div>
        ) : (
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 mb-6">
            <p className="text-text-muted mb-4">לא הוקצה לך סקיל עדיין.</p>
            <button onClick={() => router.push('/chat/demo')}
              className="w-full bg-bg-hover border border-bg-hover text-text-secondary font-semibold py-3 rounded-xl hover:bg-bg-secondary transition-colors">
              👁️ שיחת דמו — תצוגה בלבד
            </button>
          </div>
        )}

        <button onClick={handleLogout} className="text-text-muted hover:text-text-secondary text-sm transition-colors">
          התנתק
        </button>
      </div>
    </div>
  )
}

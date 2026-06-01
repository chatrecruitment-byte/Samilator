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

      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()

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
            <p className="text-text-muted">לא הוקצה לך סקיל עדיין. פנה למנהל.</p>
          </div>
        )}

        <button onClick={handleLogout} className="text-text-muted hover:text-text-secondary text-sm transition-colors">
          התנתק
        </button>
      </div>
    </div>
  )
}

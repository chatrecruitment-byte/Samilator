'use client'

import { useEffect, useState } from 'react'

interface Skill { id: string; name: string }

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/skills')
      const data = await res.json()
      if (data.error) setError(data.error)
      else setSkills(data.skills || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">סקילים (OpenAI Assistants)</h1>
          <a href="/admin/users" className="text-text-muted hover:text-text-secondary text-sm transition-colors">← מתלמדים</a>
        </div>

        {loading ? (
          <div className="text-text-muted text-center py-12">טוען...</div>
        ) : error ? (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-2xl p-6 text-center">
            <p className="text-accent-red mb-2">❌ {error}</p>
            <p className="text-text-muted text-sm">הכנס OpenAI API key בדף ההגדרות</p>
            <a href="/admin/settings" className="text-accent-purple hover:underline text-sm mt-2 inline-block">← הגדרות</a>
          </div>
        ) : (
          <div className="grid gap-3">
            {skills.map(skill => (
              <div key={skill.id} className="bg-bg-card border border-bg-hover rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">{skill.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">{skill.id}</p>
                </div>
                <span className="bg-accent-purple/20 text-accent-purple text-xs px-3 py-1 rounded-full">Assistant</span>
              </div>
            ))}
            {skills.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <p className="mb-2">אין Assistants ב-OpenAI</p>
                <p className="text-sm">צור Assistant ב-platform.openai.com/assistants</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

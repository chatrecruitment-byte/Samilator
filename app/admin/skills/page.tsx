'use client'

import { useEffect, useState } from 'react'

interface Skill {
  id: string
  name: string
  system_prompt: string
  created_at: string
}

const DEFAULT_PROMPT = `אתה מנוי ב-OnlyFans. אתה משוחח עם צ'אטר של היוצרת.
האופי שלך: [תאר כאן את אופי המנוי - לדוגמה: ביישן, סקרן, נלהב, קמצן וכו']
שמך: [שם המנוי]

התנהג בצורה טבעית וריאליסטית. הגב לפי מה שהצ'אטר אומר.
אל תהיה קל מדי לשכנוע, אבל גם לא בלתי אפשרי.`

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/skills')
    const data = await res.json()
    if (data.error) setError(data.error)
    else setSkills(data.skills || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createSkill() {
    if (!name.trim() || !systemPrompt.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), system_prompt: systemPrompt.trim() }),
    })
    const data = await res.json()
    if (data.error) setError(data.error)
    else {
      setName('')
      setSystemPrompt(DEFAULT_PROMPT)
      setShowForm(false)
      load()
    }
    setSaving(false)
  }

  async function deleteSkill(id: string) {
    if (!confirm('למחוק את הסקיל הזה?')) return
    await fetch('/api/admin/skills', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">סקילים (דמויות מנויים)</h1>
          <div className="flex items-center gap-4">
            <a href="/admin/users" className="text-text-muted hover:text-text-secondary text-sm transition-colors">← מתלמדים</a>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-accent-purple text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {showForm ? 'ביטול' : '+ סקיל חדש'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-2xl p-4 mb-6 text-accent-red text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 mb-6">
            <h2 className="text-text-primary font-semibold mb-4">סקיל חדש</h2>
            <div className="space-y-4">
              <div>
                <label className="text-text-muted text-sm block mb-1">שם הסקיל</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="לדוגמה: מנוי ביישן, מנוי קמצן..."
                  className="w-full bg-bg-primary border border-bg-hover rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
                />
              </div>
              <div>
                <label className="text-text-muted text-sm block mb-1">System Prompt (הוראות לדמות)</label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={10}
                  className="w-full bg-bg-primary border border-bg-hover rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple font-mono text-sm resize-y"
                />
              </div>
              <button
                onClick={createSkill}
                disabled={saving || !name.trim()}
                className="bg-accent-purple text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'שומר...' : 'צור סקיל'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-text-muted text-center py-12">טוען...</div>
        ) : (
          <div className="grid gap-3">
            {skills.map(skill => (
              <div key={skill.id} className="bg-bg-card border border-bg-hover rounded-xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">{skill.name}</p>
                    <p className="text-text-muted text-xs mt-0.5">{skill.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
                      className="text-text-muted hover:text-text-secondary text-xs px-3 py-1 rounded-lg border border-bg-hover hover:border-text-muted transition-colors"
                    >
                      {expandedId === skill.id ? 'סגור' : 'צפה ב-Prompt'}
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="text-accent-red hover:opacity-80 text-xs px-3 py-1 rounded-lg border border-accent-red/30 hover:border-accent-red transition-colors"
                    >
                      מחק
                    </button>
                  </div>
                </div>
                {expandedId === skill.id && (
                  <div className="px-5 pb-4 border-t border-bg-hover">
                    <pre className="text-text-muted text-xs font-mono whitespace-pre-wrap mt-3 leading-relaxed">
                      {skill.system_prompt}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            {skills.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <p className="mb-2">אין סקילים עדיין</p>
                <p className="text-sm">לחץ "+ סקיל חדש" כדי ליצור את הדמות הראשונה</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

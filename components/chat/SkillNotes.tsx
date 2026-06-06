'use client'

import { useState, useEffect } from 'react'

const PLACEHOLDER = `שם | גיל | מיקום | טראפיק:

תעסוקה:

מצב משפחתי:

סיפור כיסוי:

איך להתנהג אליו:

מתי מקבל כסף:

קינקים והעדפות:

תיעוד חליבה (1-5):

היסטוריית רכישה:`

export default function SkillNotes({ skillId }: { skillId: string }) {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/skills/${skillId}/notes`)
      const data = await res.json()
      if (data.notes?.free_text) setNotes(data.notes.free_text)
    }
    load()
  }, [skillId])

  function handleChange(val: string) {
    setNotes(val)
    setIsDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    await fetch(`/api/skills/${skillId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ free_text: notes }),
    })
    setSaved(true)
    setIsDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-hover shrink-0">
        <span className="text-text-primary font-semibold text-sm">📋 Notes</span>
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
            saved ? 'bg-accent-green/20 text-accent-green' :
            isDirty ? 'bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30' :
            'bg-bg-hover text-text-muted cursor-not-allowed'
          }`}
        >
          {saved ? 'נשמר ✓' : 'שמור'}
        </button>
      </div>
      <div className="flex-1 p-3">
        <textarea
          value={notes}
          onChange={e => handleChange(e.target.value)}
          placeholder={PLACEHOLDER}
          className="w-full h-full bg-bg-card border border-bg-hover rounded-2xl px-4 py-3 text-text-primary text-xs leading-relaxed resize-none focus:outline-none focus:border-accent-purple/50 placeholder-text-muted transition-colors"
        />
      </div>
    </div>
  )
}

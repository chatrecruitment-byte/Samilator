'use client'

import { useState, useEffect } from 'react'

interface Notes {
  name_age_location: string
  occupation: string
  family_status: string
  cover_story: string
  how_to_behave: string
  payday: string
  kinks: string
  milking_log: string
  purchase_history: string
}

const EMPTY: Notes = {
  name_age_location: '',
  occupation: '',
  family_status: '',
  cover_story: '',
  how_to_behave: '',
  payday: '',
  kinks: '',
  milking_log: '',
  purchase_history: '',
}

const FIELDS: { key: keyof Notes; label: string; rows?: number }[] = [
  { key: 'name_age_location', label: 'שם | גיל | מיקום | טראפיק' },
  { key: 'occupation', label: 'תעסוקה' },
  { key: 'family_status', label: 'מצב משפחתי' },
  { key: 'cover_story', label: 'סיפור כיסוי' },
  { key: 'how_to_behave', label: 'איך להתנהג אליו' },
  { key: 'payday', label: 'מתי מקבל כסף' },
  { key: 'kinks', label: 'קינקים והעדפות', rows: 3 },
  { key: 'milking_log', label: 'תיעוד חליבה (1-5)', rows: 3 },
  { key: 'purchase_history', label: 'היסטוריית רכישה', rows: 3 },
]

export default function SkillNotes({ skillId }: { skillId: string }) {
  const [notes, setNotes] = useState<Notes>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/skills/${skillId}/notes`)
      const data = await res.json()
      if (data.notes) setNotes({ ...EMPTY, ...data.notes })
    }
    load()
  }, [skillId])

  function handleChange(key: keyof Notes, value: string) {
    setNotes(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/skills/${skillId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    })
    setSaving(false)
    setSaved(true)
    setIsDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-hover">
        <span className="text-text-primary font-semibold text-sm">📋 Notes</span>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
            saved ? 'bg-accent-green/20 text-accent-green' :
            isDirty ? 'bg-accent-purple text-white hover:bg-accent-purple/80' :
            'bg-bg-hover text-text-muted cursor-not-allowed'
          }`}
        >
          {saved ? 'נשמר ✓' : saving ? 'שומר...' : 'שמור'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {FIELDS.map(field => (
          <div key={field.key}>
            <label className="block text-text-muted text-xs mb-1">{field.label}:</label>
            {field.rows ? (
              <textarea
                value={notes[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                rows={field.rows}
                className="w-full bg-bg-secondary border border-bg-hover rounded-lg px-2.5 py-1.5 text-text-primary text-xs resize-none focus:outline-none focus:border-accent-purple transition-colors"
              />
            ) : (
              <input
                type="text"
                value={notes[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                className="w-full bg-bg-secondary border border-bg-hover rounded-lg px-2.5 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-purple transition-colors"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

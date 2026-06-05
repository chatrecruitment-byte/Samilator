'use client'

import { useState } from 'react'

const FIELDS = [
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

export default function SkillNotesMock() {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-hover">
        <span className="text-text-primary font-semibold text-sm">📋 Notes</span>
        <button onClick={handleSave}
          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${saved ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-purple text-white hover:bg-accent-purple/80'}`}>
          {saved ? 'נשמר ✓' : 'שמור'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {FIELDS.map(field => (
          <div key={field.key}>
            <label className="block text-text-muted text-xs mb-1">{field.label}:</label>
            {field.rows ? (
              <textarea rows={field.rows} value={notes[field.key] || ''}
                onChange={e => setNotes(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full bg-bg-secondary border border-bg-hover rounded-lg px-2.5 py-1.5 text-text-primary text-xs resize-none focus:outline-none focus:border-accent-purple transition-colors" />
            ) : (
              <input type="text" value={notes[field.key] || ''}
                onChange={e => setNotes(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full bg-bg-secondary border border-bg-hover rounded-lg px-2.5 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-purple transition-colors" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

const FIELDS = [
  { key: 'name_age_location', label: 'שם | גיל | מיקום | טראפיק' },
  { key: 'occupation', label: 'תעסוקה' },
  { key: 'family_status', label: 'מצב משפחתי' },
  { key: 'cover_story', label: 'סיפור כיסוי' },
  { key: 'how_to_behave', label: 'איך להתנהג' },
  { key: 'payday', label: 'מתי מקבל כסף' },
  { key: 'kinks', label: 'קינקים והעדפות' },
  { key: 'milking_log', label: 'תיעוד חליבה (1-5)' },
  { key: 'purchase_history', label: 'היסטוריית רכישה' },
]

export default function SkillNotesMock() {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [editKey, setEditKey] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setEditKey(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-hover shrink-0">
        <span className="text-text-primary font-semibold text-sm">📋 Notes</span>
        <button onClick={handleSave}
          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${saved ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30'}`}>
          {saved ? 'נשמר ✓' : 'שמור'}
        </button>
      </div>

      {/* Single card */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="bg-bg-card border border-bg-hover rounded-2xl overflow-hidden">
          {FIELDS.map((field, i) => (
            <div key={field.key}
              className={`px-3 py-2.5 ${i < FIELDS.length - 1 ? 'border-b border-bg-hover' : ''}`}
              onClick={() => setEditKey(field.key)}>
              <p className="text-text-muted text-xs mb-1">{field.label}</p>
              {editKey === field.key ? (
                <textarea
                  autoFocus
                  value={notes[field.key] || ''}
                  onChange={e => setNotes(prev => ({ ...prev, [field.key]: e.target.value }))}
                  onBlur={() => setEditKey(null)}
                  rows={2}
                  className="w-full bg-bg-secondary border border-accent-purple/50 rounded-lg px-2 py-1 text-text-primary text-xs resize-none focus:outline-none"
                />
              ) : (
                <p className={`text-xs min-h-[16px] ${notes[field.key] ? 'text-text-primary' : 'text-text-muted italic'}`}>
                  {notes[field.key] || 'לחץ לעריכה...'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

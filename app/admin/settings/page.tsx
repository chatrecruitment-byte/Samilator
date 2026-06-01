'use client'

import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [silenceTimeout, setSilenceTimeout] = useState('60')
  const [showKey, setShowKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [silenceSaved, setSilenceSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      const settings = data.settings || []
      const key = settings.find((s: { key: string; value: string }) => s.key === 'openai_api_key')?.value || ''
      const silence = settings.find((s: { key: string; value: string }) => s.key === 'silence_timeout_seconds')?.value || '60'
      if (key) setApiKey('••••••••••••••••••••' + key.slice(-4))
      setSilenceTimeout(silence)
    }
    load()
  }, [])

  async function saveApiKey() {
    setLoading(true)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'openai_api_key', value: apiKey }),
    })
    setApiKeySaved(true)
    setShowKey(false)
    setLoading(false)
    setTimeout(() => setApiKeySaved(false), 3000)
  }

  async function saveSilence() {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'silence_timeout_seconds', value: silenceTimeout }),
    })
    setSilenceSaved(true)
    setTimeout(() => setSilenceSaved(false), 3000)
  }

  async function testConnection() {
    setTestStatus('loading')
    const res = await fetch('/api/admin/skills')
    const data = await res.json()
    setTestStatus(data.error ? 'error' : 'ok')
    setTimeout(() => setTestStatus('idle'), 4000)
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-8">הגדרות מערכת</h1>

        {/* OpenAI API Key */}
        <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">🔑 OpenAI API Key</h2>
          <div className="flex gap-2 mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="bg-bg-hover text-text-secondary px-4 py-2.5 rounded-xl hover:bg-bg-secondary transition-colors text-sm"
            >
              {showKey ? 'הסתר' : 'הצג'}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveApiKey}
              disabled={loading}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {apiKeySaved ? 'נשמר ✅' : 'שמור'}
            </button>
            <button
              onClick={testConnection}
              className="bg-bg-hover text-text-secondary px-5 py-2.5 rounded-xl hover:bg-bg-secondary transition-colors text-sm"
            >
              {testStatus === 'loading' ? 'בודק...' :
               testStatus === 'ok' ? '✅ מחובר' :
               testStatus === 'error' ? '❌ מפתח לא תקין' :
               'בדוק חיבור'}
            </button>
          </div>
        </div>

        {/* Silence Timeout */}
        <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">⏱ זמן שתיקה (שניות)</h2>
          <div className="flex gap-3">
            <input
              type="number"
              value={silenceTimeout}
              onChange={e => setSilenceTimeout(e.target.value)}
              min="10"
              max="300"
              className="w-32 bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple"
            />
            <button
              onClick={saveSilence}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              {silenceSaved ? 'נשמר ✅' : 'שמור'}
            </button>
          </div>
        </div>

        {/* Nav */}
        <a href="/admin/users" className="text-text-muted hover:text-text-secondary text-sm transition-colors">
          ← חזור לניהול מתלמדים
        </a>
      </div>
    </div>
  )
}

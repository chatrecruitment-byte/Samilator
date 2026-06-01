'use client'

import { useEffect, useState } from 'react'

interface Skill { id: string; name: string }
interface User {
  id: string
  name: string
  email: string
  level: string | null
  role: string
  created_at: string
  skill_assignments: { skill_id: string; skill_name: string }[]
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', level: 'beginner', skill_id: '', skill_name: '' })
  const [error, setError] = useState('')

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
  }

  async function loadSkills() {
    const res = await fetch('/api/admin/skills')
    const data = await res.json()
    setSkills(data.skills || [])
  }

  useEffect(() => { loadUsers(); loadSkills() }, [])

  function openAdd() {
    setEditUser(null)
    setForm({ name: '', email: '', password: '', level: 'beginner', skill_id: '', skill_name: '' })
    setError('')
    setShowModal(true)
  }

  function openEdit(user: User) {
    setEditUser(user)
    const assignment = user.skill_assignments?.[0]
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      level: user.level || 'beginner',
      skill_id: assignment?.skill_id || '',
      skill_name: assignment?.skill_name || '',
    })
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const skill = skills.find(s => s.id === form.skill_id)
      if (editUser) {
        const res = await fetch(`/api/admin/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, level: form.level, skill_id: form.skill_id, skill_name: skill?.name || '' }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, level: form.level, skill_id: form.skill_id, skill_name: skill?.name || '' }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
      }
      setShowModal(false)
      loadUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`למחוק את ${user.name}?`)) return
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    loadUsers()
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">ניהול מתלמדים</h1>
          <button onClick={openAdd} className="bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            + הוסף מתלמד
          </button>
        </div>

        <div className="bg-bg-card rounded-2xl overflow-hidden border border-bg-hover">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-hover">
                <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">שם</th>
                <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">אימייל</th>
                <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">רמה</th>
                <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">סקיל</th>
                <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">תאריך</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'trainee').map(user => (
                <tr key={user.id} className="border-b border-bg-hover hover:bg-bg-hover transition-colors">
                  <td className="px-6 py-4 text-text-primary font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-accent-purple/20 text-accent-purple text-xs font-medium px-2.5 py-1 rounded-full">
                      {LEVEL_LABELS[user.level || ''] || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{user.skill_assignments?.[0]?.skill_name || '-'}</td>
                  <td className="px-6 py-4 text-text-muted text-sm">{new Date(user.created_at).toLocaleDateString('he-IL')}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(user)} className="text-text-secondary hover:text-text-primary text-sm px-3 py-1 rounded-lg hover:bg-bg-hover transition-colors">עריכה</button>
                      <button onClick={() => handleDelete(user)} className="text-accent-red hover:text-red-400 text-sm px-3 py-1 rounded-lg hover:bg-accent-red/10 transition-colors">מחיקה</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.filter(u => u.role === 'trainee').length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted">אין מתלמדים עדיין</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-text-primary mb-6">{editUser ? 'עריכת מתלמד' : 'הוספת מתלמד'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">שם</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple" />
              </div>
              {!editUser && (
                <>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">אימייל</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">סיסמה</label>
                    <input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">רמה</label>
                <select value={form.level} onChange={e => setForm({...form, level: e.target.value})}
                  className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple">
                  <option value="beginner">מתחיל</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">מתקדם</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">סקיל</label>
                <select value={form.skill_id} onChange={e => setForm({...form, skill_id: e.target.value})}
                  className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-purple">
                  <option value="">-- בחר סקיל --</option>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {error && <p className="text-accent-red text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-bg-hover text-text-secondary py-2.5 rounded-xl hover:bg-bg-secondary transition-colors">ביטול</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {loading ? 'שומר...' : 'שמור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

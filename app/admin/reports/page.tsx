'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Report {
  id: string
  session_id: string
  overall_score: number
  total_revenue: number
  duration_minutes: number
  created_at: string
  sessions: { skill_name: string; users: { name: string } }
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('session_report')
        .select('*, sessions(skill_name, users(name))')
        .order('created_at', { ascending: false })
      setReports(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const scoreColor = (score: number) =>
    score >= 7 ? 'text-accent-green' : score >= 4 ? 'text-accent-yellow' : 'text-accent-red'

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">דוחות שיחות</h1>
          <a href="/admin/users" className="text-text-muted hover:text-text-secondary text-sm transition-colors">← מתלמדים</a>
        </div>

        {loading ? (
          <div className="text-text-muted text-center py-12">טוען...</div>
        ) : (
          <div className="bg-bg-card rounded-2xl overflow-hidden border border-bg-hover">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-hover">
                  <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">מתלמד</th>
                  <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">סקיל</th>
                  <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">ציון</th>
                  <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">הכנסות</th>
                  <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">משך</th>
                  <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">תאריך</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b border-bg-hover hover:bg-bg-hover transition-colors">
                    <td className="px-6 py-4 text-text-primary">{report.sessions?.users?.name || '-'}</td>
                    <td className="px-6 py-4 text-text-secondary">{report.sessions?.skill_name || '-'}</td>
                    <td className={`px-6 py-4 font-bold ${scoreColor(report.overall_score)}`}>{report.overall_score}/10</td>
                    <td className="px-6 py-4 text-text-primary">₪{report.total_revenue}</td>
                    <td className="px-6 py-4 text-text-secondary">{report.duration_minutes} דק'</td>
                    <td className="px-6 py-4 text-text-muted text-sm">{new Date(report.created_at).toLocaleDateString('he-IL')}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => router.push(`/report/${report.session_id}`)}
                        className="text-accent-purple hover:text-accent-pink text-sm transition-colors">
                        צפה
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-text-muted">אין דוחות עדיין</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

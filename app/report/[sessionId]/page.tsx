'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SessionReport } from '@/types'

interface ReportData extends SessionReport {
  sessions?: { skill_name: string; started_at: string }
}

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/sessions/${sessionId}/report`)
      const data = await res.json()
      setReport(data.report)
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-text-secondary">טוען דוח...</div>
    </div>
  )

  if (!report) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-text-secondary">הדוח לא נמצא</div>
    </div>
  )

  const scoreColor = report.overall_score >= 7 ? 'text-accent-green' : report.overall_score >= 4 ? 'text-accent-yellow' : 'text-accent-red'
  const moodIcon = report.skill_mood_end === 'warm' ? '🔥' : report.skill_mood_end === 'neutral' ? '😐' : '❄️'

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">דוח שיחה</h1>
          <p className="text-text-secondary text-sm">{report.sessions?.skill_name} · {new Date(report.sessions?.started_at || '').toLocaleDateString('he-IL')}</p>
        </div>

        {/* Score */}
        <div className="bg-bg-card border border-bg-hover rounded-2xl p-8 text-center mb-6">
          <div className={`text-7xl font-bold ${scoreColor} mb-2`}>{report.overall_score}</div>
          <div className="text-text-secondary text-lg">/10</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '💰', label: 'סה"כ הכנסות', value: `₪${report.total_revenue}` },
            { icon: '📊', label: 'אחוז המרה', value: `${report.conversion_rate}%` },
            { icon: '⏱', label: 'אורך שיחה', value: `${report.duration_minutes} דקות` },
            { icon: '💬', label: 'הודעות שלך', value: report.trainee_message_count },
            { icon: '🤖', label: 'הודעות הסקיל', value: report.skill_message_count },
            { icon: '🔄', label: 'יזם שיחה', value: `${report.skill_initiated_count} פעמים` },
            { icon: '😊', label: 'מצב רוח בסוף', value: `${moodIcon}` },
            { icon: '🔁', label: 'אמר שיחזור', value: report.skill_said_return ? 'כן' : 'לא' },
            { icon: '⚠️', label: 'דחיפה יתרה', value: report.pushed_too_hard ? 'כן' : 'לא' },
            { icon: '📝', label: 'ממוצע מילים', value: report.avg_words_per_message },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-card border border-bg-hover rounded-xl p-4">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-text-muted text-xs mb-0.5">{stat.label}</div>
              <div className="text-text-primary font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Top moments */}
        {report.top_moments?.length > 0 && (
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-5 mb-6">
            <h2 className="text-text-primary font-semibold mb-4">✨ רגעים מובילים</h2>
            <div className="space-y-3">
              {report.top_moments.slice(0, 3).map((moment, i) => (
                <div key={i} className="bg-bg-secondary rounded-xl p-3">
                  <p className="text-text-primary text-sm mb-1">"{moment.message}"</p>
                  <p className="text-text-muted text-xs">{moment.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI reaction */}
        {report.ai_reaction_summary && (
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-5 mb-6">
            <h2 className="text-text-primary font-semibold mb-2">🤖 תגובת ה-AI</h2>
            <p className="text-text-secondary text-sm italic">{report.ai_reaction_summary}</p>
          </div>
        )}

        {/* Recommendation */}
        {report.recommendation && (
          <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-2xl p-5 mb-8">
            <h2 className="text-accent-purple font-bold mb-2">💡 המלצה</h2>
            <p className="text-text-primary font-medium">{report.recommendation}</p>
          </div>
        )}

        <button onClick={() => router.push('/dashboard')}
          className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
          חזור לדשבורד
        </button>
      </div>
    </div>
  )
}

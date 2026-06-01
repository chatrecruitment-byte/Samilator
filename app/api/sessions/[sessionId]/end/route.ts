import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOpenAIClient } from '@/lib/openai'
import { buildReportPrompt } from '@/lib/report-prompt'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const now = new Date()
    await supabase
      .from('sessions')
      .update({ status: 'completed', ended_at: now.toISOString() })
      .eq('id', sessionId)

    const openai = await getOpenAIClient()
    const messages = await openai.beta.threads.messages.list(session.thread_id, { limit: 100 })
    const { data: purchases } = await supabase.from('purchases').select('*').eq('session_id', sessionId)

    const startedAt = new Date(session.started_at)
    const durationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000)

    const transcript = messages.data
      .reverse()
      .map(m => `${m.role === 'user' ? 'מתלמד' : 'סקיל'}: ${m.content[0]?.type === 'text' ? m.content[0].text.value : ''}`)
      .join('\n')

    const prompt = buildReportPrompt(transcript, JSON.stringify(purchases || []), durationMinutes)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let report: Record<string, unknown>
    try {
      report = JSON.parse(raw)
    } catch {
      report = {}
    }

    await supabase.from('session_report').insert({
      session_id: sessionId,
      total_revenue: report.total_revenue ?? 0,
      conversion_rate: report.conversion_rate ?? 0,
      duration_minutes: report.duration_minutes ?? durationMinutes,
      trainee_message_count: report.trainee_message_count ?? 0,
      skill_message_count: report.skill_message_count ?? 0,
      skill_mood_end: report.skill_mood_end ?? 'neutral',
      skill_said_return: report.skill_said_return ?? false,
      top_moments: report.top_moments ?? [],
      skill_initiated_count: report.skill_initiated_count ?? 0,
      pushed_too_hard: report.pushed_too_hard ?? false,
      overall_score: report.overall_score ?? 5,
      recommendation: report.recommendation ?? '',
      avg_words_per_message: report.avg_words_per_message ?? 0,
      ai_reaction_summary: report.ai_reaction_summary ?? '',
    })

    return NextResponse.json({ session_id: sessionId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOpenAIClient } from '@/lib/openai'

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
      .eq('status', 'active')
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const openai = await getOpenAIClient()
    const content = 'המתלמד שתק 60 שניות. אם אתה עדיין מעוניין בשיחה, שלח הודעה קצרה. אחרת — אל תשלח כלום.'

    await openai.beta.threads.messages.create(session.thread_id, { role: 'user', content })

    const run = await openai.beta.threads.runs.createAndPoll(
      session.thread_id,
      { assistant_id: session.skill_id },
      { timeout: 30000 }
    )

    if (run.status !== 'completed') return NextResponse.json({ reply: null })

    const messages = await openai.beta.threads.messages.list(session.thread_id, { limit: 1, order: 'desc' })
    const reply = messages.data[0]?.content[0]?.type === 'text'
      ? messages.data[0].content[0].text.value
      : null

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

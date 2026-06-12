import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import OpenAI from 'openai'

async function getOpenAI(): Promise<OpenAI> {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase.from('settings').select('value').eq('key', 'openai_api_key').single()
  if (!data?.value) throw new Error('OpenAI API key not configured')
  return new OpenAI({ apiKey: data.value })
}

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

    const adminSupabase = createAdminSupabaseClient()
    const { data: skill } = await adminSupabase
      .from('skills')
      .select('system_prompt')
      .eq('id', session.skill_id)
      .single()

    if (!skill) return NextResponse.json({ reply: null })

    const { data: history } = await supabase
      .from('session_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    const silenceNote = 'המתלמד שתק 60 שניות. אם אתה עדיין מעוניין בשיחה, שלח הודעה קצרה. אחרת — אל תשלח כלום.'

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: skill.system_prompt },
      ...(history || []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: silenceNote },
    ]

    const openai = await getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.9,
    })

    const reply = completion.choices[0]?.message?.content || null

    if (reply) {
      await supabase.from('session_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
    }

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

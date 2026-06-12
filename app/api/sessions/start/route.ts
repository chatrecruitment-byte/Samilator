import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import OpenAI from 'openai'

async function getOpenAI(): Promise<OpenAI> {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase.from('settings').select('value').eq('key', 'openai_api_key').single()
  if (!data?.value) throw new Error('OpenAI API key not configured')
  return new OpenAI({ apiKey: data.value })
}

export async function POST(req: NextRequest) {
  try {
    const { skill_id, skill_name } = await req.json()
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: assignment } = await supabase
      .from('skill_assignments')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_id', skill_id)
      .single()

    if (!assignment) return NextResponse.json({ error: 'Skill not assigned to user' }, { status: 403 })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, skill_id, skill_name, status: 'active' })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Send opening message from the skill
    const adminSupabase = createAdminSupabaseClient()
    const { data: skill } = await adminSupabase
      .from('skills')
      .select('system_prompt')
      .eq('id', skill_id)
      .single()

    if (skill) {
      const openai = await getOpenAI()
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: skill.system_prompt },
          { role: 'user', content: 'התחל את השיחה עם הודעה קצרה ופותחת.' },
        ],
        temperature: 0.9,
      })

      const opening = completion.choices[0]?.message?.content || ''
      if (opening) {
        await supabase.from('session_messages').insert({
          session_id: session.id,
          role: 'assistant',
          content: opening,
        })
      }
    }

    return NextResponse.json({ session_id: session.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

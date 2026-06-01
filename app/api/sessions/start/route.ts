import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOpenAIClient } from '@/lib/openai'

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

    const openai = await getOpenAIClient()
    const thread = await openai.beta.threads.create()

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, skill_id, skill_name, thread_id: thread.id, status: 'active' })
      .select()
      .single()

    if (sessionError) throw sessionError

    return NextResponse.json({ session_id: session.id, thread_id: thread.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

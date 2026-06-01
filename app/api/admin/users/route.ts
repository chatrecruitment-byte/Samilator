import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('*, skill_assignments(skill_id, skill_name)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ users: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, level, skill_id, skill_name } = await req.json()
    const supabase = createAdminSupabaseClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError

    const { error: userError } = await supabase
      .from('users')
      .insert({ id: authData.user.id, email, name, role: 'trainee', level })

    if (userError) throw userError

    if (skill_id && skill_name) {
      await supabase
        .from('skill_assignments')
        .insert({ user_id: authData.user.id, skill_id, skill_name })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

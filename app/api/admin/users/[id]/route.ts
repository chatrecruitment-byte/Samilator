import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, level, skill_id, skill_name } = await req.json()
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
      .from('users')
      .update({ name, level })
      .eq('id', id)

    if (error) throw error

    if (skill_id && skill_name) {
      await supabase.from('skill_assignments').delete().eq('user_id', id)
      await supabase.from('skill_assignments').insert({ user_id: id, skill_id, skill_name })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createAdminSupabaseClient()

    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) throw authError

    await supabase.from('users').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

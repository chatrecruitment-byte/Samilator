import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ skillId: string }> }) {
  try {
    const { skillId } = await params
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('skill_notes')
      .select('*')
      .eq('skill_id', skillId)
      .single()

    return NextResponse.json({ notes: data || null })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ skillId: string }> }) {
  try {
    const { skillId } = await params
    const body = await req.json()
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('skill_notes')
      .upsert({
        skill_id: skillId,
        ...body,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'skill_id' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

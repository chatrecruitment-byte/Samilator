import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('skills')
      .select('id, name, system_prompt, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ skills: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, system_prompt } = await req.json()
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('skills')
      .insert({ name, system_prompt })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ skill: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

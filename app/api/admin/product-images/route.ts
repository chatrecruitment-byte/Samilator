import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()
    const { data } = await supabase.from('product_images').select('*')
    return NextResponse.json({ images: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { product_id, image_url } = await req.json()
    const supabase = createAdminSupabaseClient()
    await supabase.from('product_images').upsert({ product_id, image_url, updated_at: new Date().toISOString() }, { onConflict: 'product_id' })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

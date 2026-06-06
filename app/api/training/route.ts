import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { messages, assistant_id } = await req.json()

    // Try real OpenAI first
    try {
      const openai = await getOpenAIClient()

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
      })

      return NextResponse.json({ reply: response.choices[0]?.message?.content || '' })
    } catch {
      // OpenAI not configured — return demo mode indicator
      return NextResponse.json({ reply: null, demo: true })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

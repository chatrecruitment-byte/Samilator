import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai'

export async function GET() {
  try {
    const openai = await getOpenAIClient()
    const assistants = await openai.beta.assistants.list({ limit: 100 })
    const skills = assistants.data.map(a => ({ id: a.id, name: a.name || a.id }))
    return NextResponse.json({ skills })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOpenAIClient } from '@/lib/openai'
import { PRODUCTS } from '@/lib/products'

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const { product_id } = await req.json()
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

    const product = PRODUCTS.find(p => p.id === product_id)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const content = `שלחתי לך הצעה: ${product.name} במחיר $${product.price}. רוצה לקנות?`

    const openai = await getOpenAIClient()
    await openai.beta.threads.messages.create(session.thread_id, { role: 'user', content })

    const run = await openai.beta.threads.runs.createAndPoll(
      session.thread_id,
      { assistant_id: session.skill_id },
      { timeout: 30000 }
    )

    if (run.status !== 'completed') {
      return NextResponse.json({ error: `Run failed: ${run.status}` }, { status: 500 })
    }

    const messages = await openai.beta.threads.messages.list(session.thread_id, { limit: 1, order: 'desc' })
    const rawReply = messages.data[0]?.content[0]?.type === 'text'
      ? messages.data[0].content[0].text.value
      : ''

    let reply = rawReply
    let purchase = null
    let leave = false

    const purchaseMatch = reply.match(/PURCHASE:(\d+)/)
    if (purchaseMatch) {
      const pid = parseInt(purchaseMatch[1])
      const p = PRODUCTS.find(pr => pr.id === pid)
      if (p) {
        await supabase.from('purchases').insert({ session_id: sessionId, product_id: p.id, product_name: p.name, price: p.price })
        purchase = { product_id: p.id, product_name: p.name, price: p.price }
      }
      reply = reply.replace(/PURCHASE:\d+/g, '').trim()
    }

    if (reply.includes('LEAVE')) {
      leave = true
      reply = reply.replace(/LEAVE/g, '').trim()
    }

    return NextResponse.json({ reply, purchase, leave })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

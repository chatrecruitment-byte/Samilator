import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { PRODUCTS } from '@/lib/products'
import OpenAI from 'openai'

async function getOpenAI(): Promise<OpenAI> {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase.from('settings').select('value').eq('key', 'openai_api_key').single()
  if (!data?.value) throw new Error('OpenAI API key not configured')
  return new OpenAI({ apiKey: data.value })
}

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

    // Save user message
    await supabase.from('session_messages').insert({ session_id: sessionId, role: 'user', content })

    // Get skill system prompt
    const adminSupabase = createAdminSupabaseClient()
    const { data: skill } = await adminSupabase
      .from('skills')
      .select('system_prompt')
      .eq('id', session.skill_id)
      .single()

    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 })

    // Get conversation history
    const { data: history } = await supabase
      .from('session_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    const productList = PRODUCTS.map(p => `${p.id}: ${p.name} - $${p.price}`).join('\n')
    const systemPrompt = `${skill.system_prompt}

כאשר אתה מחליט לרכוש מוצר, כלול בהודעתך: PURCHASE:[מספר מוצר]
כאשר אתה רוצה לסיים את השיחה ולעזוב, כלול: LEAVE

רשימת מוצרים:
${productList}`

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const openai = await getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.9,
    })

    const rawReply = completion.choices[0]?.message?.content || ''

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

    // Save assistant reply
    await supabase.from('session_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })

    return NextResponse.json({ reply, purchase, leave })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

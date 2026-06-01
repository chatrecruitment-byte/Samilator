'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS } from '@/lib/products'
import { ChatMessage } from '@/types'
import { createClient } from '@/lib/supabase'

export default function ChatPage() {
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [silenceProgress, setSilenceProgress] = useState(0)
  const [skillName, setSkillName] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [ending, setEnding] = useState(false)
  const [silenceTimeout, setSilenceTimeout] = useState(60)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const silenceRef = useRef<NodeJS.Timeout | null>(null)
  const silenceStartRef = useRef<number>(Date.now())
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: session } = await supabase.from('sessions').select('skill_name').eq('id', sessionId).single()
      setSkillName(session?.skill_name || '')

      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      const timeout = data.settings?.find((s: { key: string; value: string }) => s.key === 'silence_timeout_seconds')?.value
      if (timeout) setSilenceTimeout(parseInt(timeout))
    }
    load()
  }, [sessionId])

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [])

  const resetSilence = useCallback(() => {
    silenceStartRef.current = Date.now()
    setSilenceProgress(0)
  }, [])

  const handleSilence = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}/silence`, { method: 'POST' })
    const data = await res.json()
    if (data.reply) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.reply }])
    }
    resetSilence()
  }, [sessionId, resetSilence])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - silenceStartRef.current) / 1000
      const progress = Math.min((elapsed / silenceTimeout) * 100, 100)
      setSilenceProgress(progress)
      if (elapsed >= silenceTimeout) {
        handleSilence()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [silenceTimeout, handleSilence])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  async function sendMessage() {
    if (!input.trim() || isTyping) return
    const text = input.trim()
    setInput('')
    resetSilence()
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setIsTyping(true)

    const res = await fetch(`/api/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
    const data = await res.json()
    setIsTyping(false)
    resetSilence()

    if (data.reply) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }])
    }
    if (data.purchase) {
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'purchase', content: '', purchase: data.purchase }])
    }
    if (data.leave) endSession()
  }

  async function sendProduct(productId: number) {
    if (isTyping) return
    resetSilence()
    setIsTyping(true)
    const res = await fetch(`/api/sessions/${sessionId}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    const data = await res.json()
    setIsTyping(false)
    resetSilence()

    const product = PRODUCTS.find(p => p.id === productId)
    if (product) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: `שלחתי לך הצעה: ${product.name} במחיר ₪${product.price}` }])
    }
    if (data.reply) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }])
    }
    if (data.purchase) {
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'purchase', content: '', purchase: data.purchase }])
    }
  }

  async function endSession() {
    setEnding(true)
    await fetch(`/api/sessions/${sessionId}/end`, { method: 'POST' })
    router.push(`/report/${sessionId}`)
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-bg-hover">
        <button onClick={() => router.push('/dashboard')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">← חזור</button>
        <span className="text-text-primary font-semibold">{skillName}</span>
        <span className="text-text-secondary text-sm font-mono">⏱ {formatTime(elapsed)}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : msg.role === 'purchase' ? 'justify-center' : 'justify-end'}`}
                >
                  {msg.role === 'purchase' ? (
                    <div className="bg-accent-green/20 border border-accent-green/40 text-accent-green text-sm px-4 py-2 rounded-2xl">
                      ✅ {msg.purchase?.product_name} — ₪{msg.purchase?.price}
                    </div>
                  ) : (
                    <div className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-accent-purple to-accent-pink text-white rounded-[18px_18px_4px_18px]'
                        : 'bg-bg-card text-text-primary rounded-[18px_18px_18px_4px]'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="bg-bg-card px-4 py-3 rounded-[18px_18px_18px_4px] flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-text-muted rounded-full"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Silence bar */}
          <div className="h-1 bg-bg-hover">
            <div className="h-full bg-accent-red transition-all duration-500" style={{ width: `${silenceProgress}%` }} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 bg-bg-secondary border-t border-bg-hover">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="כתוב הודעה..."
              className="flex-1 bg-bg-card border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple text-sm"
            />
            <button onClick={sendMessage} disabled={isTyping}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-semibold">
              שלח
            </button>
            <button onClick={() => setShowEndModal(true)}
              className="bg-bg-hover text-text-secondary px-4 py-2.5 rounded-xl hover:bg-bg-card transition-colors text-sm">
              סיים
            </button>
          </div>
        </div>

        {/* Products panel */}
        <div className="w-44 bg-bg-secondary border-r border-bg-hover overflow-y-auto p-3 flex flex-col gap-2">
          <p className="text-text-secondary text-xs font-medium mb-1 text-center">מוצרים</p>
          {PRODUCTS.map(product => (
            <button key={product.id} onClick={() => sendProduct(product.id)} disabled={isTyping}
              className="bg-bg-card hover:bg-bg-hover border border-bg-hover rounded-xl p-2 text-right transition-colors disabled:opacity-50">
              <div className="w-full h-12 bg-bg-hover rounded-lg mb-1.5 flex items-center justify-center text-text-muted text-xs">📷</div>
              <p className="text-text-primary text-xs font-medium leading-tight">{product.name}</p>
              <p className="text-accent-green text-xs">₪{product.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* End modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 w-80 text-center">
            <h3 className="text-text-primary font-bold text-lg mb-2">לסיים את השיחה?</h3>
            <p className="text-text-secondary text-sm mb-6">הדוח יכין עצמו אוטומטית</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndModal(false)} className="flex-1 bg-bg-hover text-text-secondary py-2.5 rounded-xl hover:bg-bg-secondary transition-colors">ביטול</button>
              <button onClick={endSession} disabled={ending}
                className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                {ending ? 'מסיים...' : 'סיים'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

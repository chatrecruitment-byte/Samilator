'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS } from '@/lib/products'
import { ChatMessage } from '@/types'
import SkillNotesMock from '@/components/chat/SkillNotesMock'

const DEMO_REPLIES = [
  'היי! מה שלומך? 😊',
  'אוקיי, מעניין אותי לשמוע עוד...',
  'לא בטוח, תגיד לי יותר על זה',
  'הממ, צריך לחשוב על זה...',
  'נשמע טוב! ספר לי עוד',
  'אולי... כמה זה עולה?',
  'יקר לי קצת, אפשר הנחה?',
  'בסדר, אני שוקל את זה 🤔',
]

let replyIndex = 0

export default function DemoChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: 'שלום! זוהי שיחת דמו לבדיקת ממשק המשתמש. כל הפונקציות זמינות 👋' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [silenceProgress, setSilenceProgress] = useState(0)
  const [showProducts, setShowProducts] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const silenceStartRef = useRef<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const e = (Date.now() - silenceStartRef.current) / 1000
      setSilenceProgress(Math.min((e / 60) * 100, 100))
      if (e >= 60) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'עדיין שם? 👀' }])
        silenceStartRef.current = Date.now()
        setSilenceProgress(0)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage() {
    if (!input.trim() || isTyping) return
    const text = input.trim()
    setInput('')
    silenceStartRef.current = Date.now()
    setSilenceProgress(0)
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 800 + Math.random() * 800))
    setIsTyping(false)
    silenceStartRef.current = Date.now()
    const reply = DEMO_REPLIES[replyIndex % DEMO_REPLIES.length]
    replyIndex++
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }])
  }

  async function sendProduct(productId: number) {
    if (isTyping) return
    const product = PRODUCTS.find(p => p.id === productId)
    if (!product) return
    setShowProducts(false)
    silenceStartRef.current = Date.now()
    setSilenceProgress(0)
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: `שלחתי לך הצעה: ${product.name} במחיר ₪${product.price}` }])
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsTyping(false)
    silenceStartRef.current = Date.now()
    const accepted = Math.random() > 0.5
    if (accepted) {
      setTotalRevenue(prev => prev + product.price)
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'בסדר, אני קונה! 💳' },
        { id: (Date.now() + 2).toString(), role: 'purchase', content: '', purchase: { product_name: product.name, price: product.price } }
      ])
    } else {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'לא תודה, יקר לי 😅' }])
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-bg-hover shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">← חזור</button>
        <div className="flex items-center gap-3">
          <span className="bg-accent-yellow/20 text-accent-yellow text-xs px-2 py-0.5 rounded-full font-medium">דמו</span>
          <span className="text-text-primary font-semibold">שיחת בדיקה</span>
          {totalRevenue > 0 && (
            <span className="bg-accent-green/20 text-accent-green text-xs font-bold px-2.5 py-1 rounded-full">₪{totalRevenue}</span>
          )}
        </div>
        <button onClick={() => setShowEndModal(true)} className="text-text-muted hover:text-accent-red text-sm transition-colors">סיים</button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* CENTER — Chat */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : msg.role === 'purchase' ? 'justify-center' : 'justify-end'}`}>
                  {msg.role === 'purchase' ? (
                    <div className="bg-accent-green/20 border border-accent-green/40 text-accent-green text-sm px-4 py-2 rounded-2xl">
                      ✅ {msg.purchase?.product_name} — ₪{msg.purchase?.price}
                    </div>
                  ) : (
                    <div className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-accent-purple to-accent-pink text-white rounded-[18px_18px_4px_18px]'
                        : 'bg-bg-card text-text-primary rounded-[18px_18px_18px_4px]'
                    }`}>{msg.content}</div>
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
          <div className="h-0.5 bg-bg-hover shrink-0">
            <div className="h-full bg-accent-red transition-all duration-500" style={{ width: `${silenceProgress}%` }} />
          </div>

          {/* Input */}
          <div className="relative p-3 bg-bg-secondary border-t border-bg-hover shrink-0">
            {/* Products popup */}
            <AnimatePresence>
              {showProducts && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-3 right-3 mb-2 bg-bg-card border border-bg-hover rounded-2xl p-3 shadow-2xl z-10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-primary font-semibold text-sm">שלח מוצר</span>
                    <button onClick={() => setShowProducts(false)} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {PRODUCTS.map(product => (
                      <button key={product.id} onClick={() => sendProduct(product.id)} disabled={isTyping}
                        className="bg-bg-secondary hover:bg-bg-hover border border-bg-hover rounded-xl p-2 text-right transition-colors disabled:opacity-50">
                        <div className="w-full h-12 bg-bg-hover rounded-lg mb-1.5 flex items-center justify-center text-lg">📷</div>
                        <p className="text-text-primary text-xs font-medium leading-tight">{product.name}</p>
                        <p className="text-accent-green text-xs font-bold">₪{product.price}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button
                onClick={() => setShowProducts(!showProducts)}
                className={`px-3 py-2.5 rounded-xl border transition-colors text-sm ${showProducts ? 'bg-accent-purple/20 border-accent-purple text-accent-purple' : 'bg-bg-card border-bg-hover text-text-secondary hover:text-text-primary'}`}
              >
                📎
              </button>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="כתוב הודעה..."
                className="flex-1 bg-bg-card border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple text-sm" />
              <button onClick={sendMessage} disabled={isTyping}
                className="bg-gradient-to-r from-accent-purple to-accent-pink text-white px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-semibold">
                שלח
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Notes */}
        <div className="w-64 bg-bg-secondary border-r border-bg-hover flex flex-col shrink-0 overflow-hidden">
          <SkillNotesMock />
        </div>
      </div>

      {/* End modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-bg-card border border-bg-hover rounded-2xl p-6 w-80 text-center">
            <h3 className="text-text-primary font-bold text-lg mb-2">לסיים את הדמו?</h3>
            <p className="text-text-secondary text-sm mb-6">בדמו אין דוח — זה רק לבדיקת ממשק</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndModal(false)} className="flex-1 bg-bg-hover text-text-secondary py-2.5 rounded-xl hover:bg-bg-secondary transition-colors">ביטול</button>
              <button onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                סיים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'ai' | 'user'
  content: string
  type?: 'question' | 'feedback' | 'score'
  correct?: boolean
}

// Demo questions for when OpenAI is not connected
const DEMO_QA = [
  {
    question: 'מנוי חדש נכנס לראשונה לפרופיל שלך — מה הצעד הראשון שאתה עושה?',
    answer: 'שולחים הודעת ברוכים הבאים חמה ואישית, שואלים שאלה פותחת כדי לגרום לו לדבר, ומנסים להבין מה הוא מחפש.',
    keywords: ['ברוכים', 'שאלה', 'אישי', 'הבנה', 'מה הוא מחפש', 'היכרות'],
  },
  {
    question: 'מנוי אומר לך "יקר לי" — איך אתה מגיב?',
    answer: 'לא מתווכחים על המחיר. מסכימים שהוא יקר ומסבירים את הערך הייחודי. מציעים מוצר זול יותר להתחלה ובונים אמון.',
    keywords: ['ערך', 'לא מתווכח', 'מוצר זול', 'אמון', 'מבין'],
  },
  {
    question: 'מתי הזמן הכי טוב לשלוח הצעת PPV למנוי?',
    answer: 'אחרי שבנינו שיחה ויש חום בין שנינו. לא בהודעה הראשונה. הכי טוב אחרי שהמנוי פתח שיחה ומראה עניין.',
    keywords: ['חום', 'שיחה', 'לא ראשון', 'עניין', 'קשר'],
  },
  {
    question: 'מנוי לא עונה כבר 3 ימים — מה עושים?',
    answer: 'שולחים הודעת re-engagement קצרה ואישית. לא מתלוננים ולא שולחים PPV. שואלים שאלה שמזמינה תגובה.',
    keywords: ['הודעה', 'קצרה', 'אישית', 'שאלה', 'לא PPV', 'לא מתלונן'],
  },
  {
    question: 'מה ההבדל בין מנוי שרוצה לקנות למנוי שסתם מדבר?',
    answer: 'מנוי שרוצה לקנות שואל על מחירים, מבקש תכנים ספציפיים, מגיב מהר ומדבר בחום. מנוי שסתם מדבר מתחמק כשמציעים.',
    keywords: ['מחיר', 'תכנים', 'מגיב', 'מבקש', 'מתחמק'],
  },
]

export default function TrainingPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [score, setScore] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isDemo, setIsDemo] = useState(false)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startTraining() {
    setStarted(true)
    const firstQ = DEMO_QA[0]
    setMessages([{
      id: '1',
      role: 'ai',
      content: `שלום! אני כאן כדי לבחון אותך על מה שלמדת 🎓\n\nיש לנו ${DEMO_QA.length} שאלות היום. בהצלחה!\n\n**שאלה 1 מתוך ${DEMO_QA.length}:**\n${firstQ.question}`,
      type: 'question',
    }])
  }

  function checkAnswer(userAnswer: string, qIndex: number): { correct: boolean; feedback: string } {
    const qa = DEMO_QA[qIndex]
    const answerLower = userAnswer.toLowerCase()
    const matchedKeywords = qa.keywords.filter(kw => answerLower.includes(kw.toLowerCase()))
    const correct = matchedKeywords.length >= 2

    const feedback = correct
      ? `✅ **תשובה טובה!**\n\n${qa.answer}`
      : `❌ **לא מדויק.**\n\n**התשובה הנכונה:**\n${qa.answer}`

    return { correct, feedback }
  }

  async function sendAnswer() {
    if (!input.trim() || isLoading || finished) return
    const userText = input.trim()
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Try real OpenAI
    const systemPrompt = `אתה מאמן מקצועי לצ'אטרים ב-OnlyFans. תפקידך לבחון את המתלמד ולתת פידבק.
חומר הלימוד: כיצד לעבוד נכון עם מנויים — בניית קשר, מכירת PPV, טיפול בהתנגדויות.
שאלה נוכחית: ${DEMO_QA[questionIndex].question}
תשובת המתלמד: ${userText}

בדוק אם התשובה נכונה. תן פידבק ברור בעברית: האם נכון/לא נכון, למה, ומה התשובה הכי טובה.
סיים עם: "מוכן לשאלה הבאה?" אם יש עוד שאלות, או "סיימנו!" אם זו האחרונה.`

    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
      }),
    })
    const data = await res.json()

    let feedbackContent: string
    let correct: boolean

    if (data.demo || !data.reply) {
      setIsDemo(true)
      const result = checkAnswer(userText, questionIndex)
      feedbackContent = result.feedback
      correct = result.correct
    } else {
      feedbackContent = data.reply
      correct = data.reply.includes('✅') || data.reply.toLowerCase().includes('נכון') || data.reply.toLowerCase().includes('מצוין')
    }

    if (correct) setScore(prev => prev + 1)

    const feedbackMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: feedbackContent,
      type: 'feedback',
      correct,
    }
    setMessages(prev => [...prev, feedbackMsg])

    const nextIndex = questionIndex + 1
    setQuestionIndex(nextIndex)

    if (nextIndex < DEMO_QA.length) {
      setTimeout(() => {
        const nextQ = DEMO_QA[nextIndex]
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'ai',
          content: `**שאלה ${nextIndex + 1} מתוך ${DEMO_QA.length}:**\n${nextQ.question}`,
          type: 'question',
        }])
        setIsLoading(false)
      }, 800)
    } else {
      const finalScore = score + (correct ? 1 : 0)
      setTimeout(() => {
        setFinished(true)
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'ai',
          content: `🎉 **סיימת את האימון!**\n\nציון: **${finalScore}/${DEMO_QA.length}**\n\n${
            finalScore === DEMO_QA.length ? 'מושלם! אתה מוכן לשיחות אמיתיות 🏆' :
            finalScore >= DEMO_QA.length * 0.7 ? 'עבודה טובה! עוד קצת תרגול ותהיה מעולה 💪' :
            'כדאי לחזור על החומר ולנסות שוב 📚'
          }`,
          type: 'score',
        }])
        setIsLoading(false)
      }, 800)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-bg-hover shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">← חזור</button>
        <div className="flex items-center gap-3">
          <span className="text-text-primary font-semibold">🎓 אימון מקצועי</span>
          {isDemo && <span className="bg-accent-yellow/20 text-accent-yellow text-xs px-2 py-0.5 rounded-full">דמו</span>}
        </div>
        {started && (
          <span className="text-text-secondary text-sm">{score}/{DEMO_QA.length} ✓</span>
        )}
        {!started && <div className="w-16" />}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {!started ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="text-6xl">🎓</div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">אימון מקצועי</h1>
              <p className="text-text-secondary text-sm max-w-sm">
                הבינה תשאל אותך {DEMO_QA.length} שאלות על העבודה הנכונה עם מנויים.
                ענה בחופשיות — הבינה תתקן ותסביר.
              </p>
            </div>
            <button onClick={startTraining}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity text-lg">
              התחל אימון
            </button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-accent-purple to-accent-pink text-white rounded-[18px_18px_4px_18px]'
                      : msg.type === 'feedback' && msg.correct
                      ? 'bg-accent-green/10 border border-accent-green/30 text-text-primary rounded-[18px_18px_18px_4px]'
                      : msg.type === 'feedback' && !msg.correct
                      ? 'bg-accent-red/10 border border-accent-red/30 text-text-primary rounded-[18px_18px_18px_4px]'
                      : msg.type === 'score'
                      ? 'bg-accent-purple/10 border border-accent-purple/30 text-text-primary rounded-[18px_18px_18px_4px]'
                      : 'bg-bg-card text-text-primary rounded-[18px_18px_18px_4px]'
                  }`}>
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="bg-bg-card px-4 py-3 rounded-[18px_18px_18px_4px] flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-text-muted rounded-full"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {started && !finished && (
        <div className="p-4 bg-bg-secondary border-t border-bg-hover shrink-0 max-w-2xl mx-auto w-full">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAnswer()}
              placeholder="כתוב את תשובתך כאן..."
              disabled={isLoading}
              className="flex-1 bg-bg-card border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple text-sm disabled:opacity-50"
            />
            <button onClick={sendAnswer} disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-semibold">
              שלח
            </button>
          </div>
        </div>
      )}

      {/* Finished */}
      {finished && (
        <div className="p-4 bg-bg-secondary border-t border-bg-hover shrink-0 max-w-2xl mx-auto w-full">
          <div className="flex gap-3">
            <button onClick={() => { setMessages([]); setScore(0); setQuestionIndex(0); setFinished(false); setStarted(false) }}
              className="flex-1 bg-bg-hover text-text-secondary py-2.5 rounded-xl hover:bg-bg-card transition-colors text-sm">
              נסה שוב
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
              חזור לדשבורד
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'trainee'
  level: 'beginner' | 'intermediate' | 'advanced' | null
  created_at: string
}

export interface SkillAssignment {
  id: string
  user_id: string
  skill_id: string
  skill_name: string
  assigned_at: string
}

export interface Session {
  id: string
  user_id: string
  skill_id: string
  skill_name: string
  thread_id: string
  started_at: string
  ended_at: string | null
  status: 'active' | 'completed'
}

export interface SessionReport {
  id: string
  session_id: string
  total_revenue: number
  conversion_rate: number
  duration_minutes: number
  trainee_message_count: number
  skill_message_count: number
  skill_mood_end: 'warm' | 'neutral' | 'cold'
  skill_said_return: boolean
  top_moments: { message: string; reason: string }[]
  skill_initiated_count: number
  pushed_too_hard: boolean
  overall_score: number
  recommendation: string
  avg_words_per_message: number
  ai_reaction_summary: string
  created_at: string
}

export interface Purchase {
  id: string
  session_id: string
  product_id: number
  product_name: string
  price: number
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'purchase'
  content: string
  purchase?: { product_name: string; price: number }
}

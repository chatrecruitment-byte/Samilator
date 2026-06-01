import OpenAI from 'openai'
import { createAdminSupabaseClient } from './supabase-server'

export async function getOpenAIClient(): Promise<OpenAI> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'openai_api_key')
    .single()

  if (error || !data?.value) {
    throw new Error('OpenAI API key not configured. Go to Settings.')
  }

  return new OpenAI({ apiKey: data.value })
}

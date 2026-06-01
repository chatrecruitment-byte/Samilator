export function buildReportPrompt(
  transcript: string,
  purchasesJson: string,
  duration: number
): string {
  return `You are analyzing a sales training conversation. The trainee (user) tried to sell content to an AI customer (assistant).

Conversation:
${transcript}

Purchases made:
${purchasesJson}

Duration: ${duration} minutes

Return ONLY valid JSON, no markdown, no explanation:
{
  "total_revenue": number,
  "conversion_rate": number,
  "duration_minutes": number,
  "trainee_message_count": number,
  "skill_message_count": number,
  "skill_mood_end": "warm" | "neutral" | "cold",
  "skill_said_return": boolean,
  "top_moments": [{ "message": string, "reason": string }],
  "skill_initiated_count": number,
  "pushed_too_hard": boolean,
  "overall_score": number,
  "recommendation": string,
  "avg_words_per_message": number,
  "ai_reaction_summary": string
}`
}

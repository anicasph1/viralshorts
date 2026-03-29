import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';
const SYSTEM_PROMPT = `
You are a world-class AI content generator with ChatGPT-level quality.

Generate 3 viral food battle scripts.

Return ONLY JSON:
{
  "battles": [...]
}
`;

export async function generateBattles(): Promise<FoodBattle[]> {
  if (!API_KEY) {
    throw new Error('Missing AICC API key');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4.1-fast',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Generate 3 viral food battle scripts.' }
      ],
      temperature: 0.9,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AICC error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content from AICC');
  }

  // extract JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return parsed.battles;
}

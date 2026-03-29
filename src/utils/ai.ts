import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

const SYSTEM_PROMPT = `
You MUST return ONLY valid JSON.

Create 3 viral food battle scenarios.

STRICT FORMAT:
{
  "battles": [
    {
      "title": "very catchy viral title",
      "scene": "cinematic setting",
      "hero_food": "healthy food",
      "villain_food": "junk food",
      "dialogue": [
        { "speaker": "hero", "line": "20-35 words aggressive confident line" },
        { "speaker": "villain", "line": "20-35 words funny defensive line" },
        { "speaker": "hero", "line": "20-35 words final domination line" }
      ],
      "image_prompt": "cinematic 3D Pixar-style, dramatic lighting, ultra detailed",
      "video_prompt": "cinematic action, dramatic movement, emotional energy",
      "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
  ]
}

RULES:
- Output JSON ONLY
- No explanation
- No extra text
- Make it viral, emotional, cinematic
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
        { role: 'user', content: 'Generate now.' }
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

  // Extract JSON safely
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse JSON');
  }

  // ✅ SAFE RETURN (fix sa map error mo)
  if (Array.isArray(parsed.battles)) {
    return parsed.battles;
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  return [parsed];
}

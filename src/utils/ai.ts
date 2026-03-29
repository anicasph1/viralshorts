import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

const SYSTEM_PROMPT = `
You are a viral short-form content writer.

Create 3 food battles that feel like REAL confrontations.

STYLE:
- Raw
- Emotional
- Aggressive but natural
- Sounds like real people arguing

CHARACTER BEHAVIOR:
- HERO = dominant, confident, slightly intimidating
- VILLAIN = slightly scared but hides it with humor, sarcasm, teasing, or cocky attitude

DIALOGUE RULES:
- EXACTLY 3 lines
- 20–30 words each
- Must feel like real speech (not poetic AI)
- Use contractions (you're, I'm, don't)
- Add attitude, tension, personality

DYNAMIC:
- Villain should sound like:
  → joking but nervous
  → teasing the hero
  → acting tough but clearly pressured

- Hero should:
  → call out weakness
  → sound in control
  → deliver final domination line

FORMAT:
Return ONLY JSON:
{
  "battles": [
    {
      "title": "viral catchy title",
      "scene": "cinematic setting",
      "hero_food": "food name",
      "villain_food": "food name",
      "dialogue": [
        { "speaker": "hero", "line": "..." },
        { "speaker": "villain", "line": "..." },
        { "speaker": "hero", "line": "..." }
      ],
      "image_prompt": "3D Pixar cinematic, ultra detailed, dramatic lighting",
      "video_prompt": "cinematic action, slow motion, intense movement",
      "seo_keywords": ["viral food battle", "healthy vs junk", "food war"]
    }
  ]
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

  // Extract JSON safely
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.battles || !Array.isArray(parsed.battles)) {
    throw new Error('Invalid battles format');
  }

  return parsed.battles;
}

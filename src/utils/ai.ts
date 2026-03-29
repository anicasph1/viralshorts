import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';
const SYSTEM_PROMPT = `
You are a top-tier viral content creator.

Your style:
- Aggressive
- Emotional
- Cinematic
- Highly engaging
- TikTok / YouTube Shorts optimized

Create 3 food battles that feel like a MOVIE TRAILER.

STRICT RULES:
- Output ONLY JSON
- No explanations
- No extra text

DIALOGUE STYLE:
- Hero = dominant, savage, confident
- Villain = defensive, funny, insecure
- Every line must feel HUMAN (not robotic)
- Each line: 20–30 words ONLY

Make lines:
- punchy
- memorable
- slightly exaggerated
- emotionally charged

FORMAT:
{
  "battles": [
    {
      "title": "EXTREMELY catchy, clickbait, viral title",
      "scene": "cinematic, intense environment",
      "hero_food": "healthy food",
      "villain_food": "junk food",
      "dialogue": [
        { "speaker": "hero", "line": "..." },
        { "speaker": "villain", "line": "..." },
        { "speaker": "hero", "line": "..." }
      ],
      "image_prompt": "3D Pixar cinematic, dramatic lighting, ultra detailed, depth of field",
      "video_prompt": "cinematic action, slow motion, dramatic camera movement, epic energy",
      "seo_keywords": ["viral food battle", "healthy vs junk", "food war", "nutrition", "viral shorts"]
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
      model: 'x-ai/grok-4.1-fast',
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

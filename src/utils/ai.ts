import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

// ✅ CLEAN PROMPT (NO BUGS)
const SYSTEM_PROMPT = `
You are an elite AI scriptwriter for viral food battle videos.

RULES:
- Only 2 foods: hero_food and villain_food
- Do NOT mention any other food
- Every hero line must include hero_food
- Every villain line must include villain_food
- Keep lines short, natural, and cinematic

STYLE:
Hero = dominant, aggressive
Villain = defensive, teasing

OUTPUT:
Return ONLY JSON. No explanation.

FORMAT:
{
  "battles": [
    {
      "title": "short title",
      "scene": "cinematic setting",
      "hero_food": "food name",
      "villain_food": "food name",
      "dialogue": [
        { "speaker": "hero", "line": "..." },
        { "speaker": "villain", "line": "..." },
        { "speaker": "hero", "line": "..." }
      ],
      "image_prompt": "3D Pixar cinematic food battle",
      "video_prompt": "cinematic dramatic food fight",
      "seo_keywords": ["food", "battle", "viral"]
    }
  ]
}
`;

// ✅ SAFE JSON PARSER
function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON');
    return JSON.parse(match[0]);
  }
}

// ✅ SIMPLE VALIDATION (NOT OVERSTRICT)
function validate(battle: any) {
  const hero = battle.hero_food.toLowerCase();
  const villain = battle.villain_food.toLowerCase();

  for (const d of battle.dialogue) {
    const line = d.line.toLowerCase();

    if (d.speaker === 'hero' && !line.includes(hero)) {
      throw new Error(`Hero mismatch: ${line}`);
    }

    if (d.speaker === 'villain' && !line.includes(villain)) {
      throw new Error(`Villain mismatch: ${line}`);
    }
  }
}

// ✅ FETCH
async function callAI() {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4.1-fast',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Generate 3 food battles.' },
      ],
      temperature: 0.9,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

// 🚀 MAIN FUNCTION
export async function generateBattles(): Promise<FoodBattle[]> {
  if (!API_KEY) throw new Error('Missing API key');

  const data = await callAI();

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No AI response');

  const parsed = safeParse(content);

  if (!parsed.battles) throw new Error('Invalid structure');

  parsed.battles.forEach(validate);

  return parsed.battles;
}

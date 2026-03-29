import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

// 🔥 STRONG PROMPT (ANTI-MALI)
const SYSTEM_PROMPT = `
You are an elite AI scriptwriter.

CRITICAL RULES (MUST FOLLOW):
- The HERO and VILLAIN foods must ALWAYS match the dialogue.
- NEVER mention any food that is NOT the hero or villain.
- If hero is "Kale", ALL hero lines must reference kale only.
- If villain is "Candy Bar", ALL villain lines must reference candy bar only.
- NO random foods (no chocolate, pizza, soda unless they are the actual characters).

DIALOGUE STYLE:
- Hero = aggressive, dominant, confident
- Villain = slightly scared, defensive, but teasing
- Natural human tone (NOT robotic)
- Cinematic, emotional, viral

FORMAT STRICTLY:
{
  "battles": [
    {
      "title": "...",
      "scene": "...",
      "hero_food": "...",
      "villain_food": "...",
      "dialogue": [
        { "speaker": "hero", "line": "..." },
        { "speaker": "villain", "line": "..." },
        { "speaker": "hero", "line": "..." }
      ],
      "image_prompt": "...",
      "video_prompt": "...",
      "seo_keywords": ["...", "..."]
    }
  ]
}

FINAL RULE:
If you mention a wrong food → output is INVALID.
`;

// 🔥 VALIDATION (ANTI-MISMATCH)
function validateBattle(battle: any) {
  const hero = battle.hero_food.toLowerCase();
  const villain = battle.villain_food.toLowerCase();

  for (const d of battle.dialogue) {
    const line = d.line.toLowerCase();

    if (d.speaker === "hero" && !line.includes(hero)) {
      throw new Error(`Hero mismatch: ${line}`);
    }

    if (d.speaker === "villain" && !line.includes(villain)) {
      throw new Error(`Villain mismatch: ${line}`);
    }
  }
}

// 🔁 AUTO RETRY (IMPORTANT)
async function fetchWithRetry(body: any, retries = 2): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return await res.json();

  } catch (err) {
    if (retries > 0) {
      return fetchWithRetry(body, retries - 1);
    }
    throw err;
  }
}

// 🚀 MAIN FUNCTION
export async function generateBattles(): Promise<FoodBattle[]> {
  if (!API_KEY) {
    throw new Error('Missing AICC API key');
  }

  const data = await fetchWithRetry({
    model: 'gpt-3.5-turbo', // ⚠️ SAFE fallback (pwede mo palitan later)
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Generate 3 viral food battles.' }
    ],
    temperature: 0.9,
    max_tokens: 1500,
  });

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content from AI');
  }

  // 🔍 Extract JSON safely
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Invalid JSON format');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.battles || !Array.isArray(parsed.battles)) {
    throw new Error('Invalid battles format');
  }

  // ✅ VALIDATE EACH BATTLE
  parsed.battles.forEach(validateBattle);

  return parsed.battles;
}

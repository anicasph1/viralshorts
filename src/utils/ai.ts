import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

// 🔥 ULTRA STRICT PROMPT (FIXED)
const SYSTEM_PROMPT = `
You are an elite AI scriptwriter creating viral short-form food battle content.

CRITICAL RULES (MUST FOLLOW STRICTLY):
- The HERO and VILLAIN foods must ALWAYS match the dialogue.
- NEVER mention any food that is NOT the hero or villain.
- If hero is "Kale", ALL hero lines must reference kale.
- If villain is "Candy Bar", ALL villain lines must reference candy bar.
- Do NOT introduce random foods (NO chocolate, pizza, soda unless they are characters).

DIALOGUE STYLE:
- Hero = dominant, aggressive, confident
- Villain = defensive, slightly scared, but teasing
- Natural human tone (NOT robotic)
- Short, punchy, viral lines
- Cinematic energy

OUTPUT RULES:
- STRICT JSON ONLY
- NO explanation
- NO extra text
- NO markdown

FORMAT:
{
  "battles": [
    {
      "title": "short viral title",
      "scene": "cinematic setting",
      "hero_food": "exact hero name",
      "villain_food": "exact villain name",
      "dialogue": [
        { "speaker": "hero", "line": "..." },
        { "speaker": "villain", "line": "..." },
        { "speaker": "hero", "line": "..." }
      ],
      "image_prompt": "3D Pixar cinematic food battle, dramatic lighting, depth of field",
      "video_prompt": "cinematic food battle, intense motion, dramatic camera",
      "seo_keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

FINAL RULE:
If ANY wrong food is mentioned → output is INVALID.
`;

// ✅ SMART VALIDATION (FIXED)
function includesFood(line: string, food: string) {
  const words = food.toLowerCase().split(' ');
  return words.some(word => line.includes(word));
}

function validateBattle(battle: any) {
  const hero = battle.hero_food.toLowerCase();
  const villain = battle.villain_food.toLowerCase();

  for (const d of battle.dialogue) {
    const line = d.line.toLowerCase();

    if (d.speaker === 'hero' && !includesFood(line, hero)) {
      throw new Error(`Hero mismatch: ${line}`);
    }

    if (d.speaker === 'villain' && !includesFood(line, villain)) {
      throw new Error(`Villain mismatch: ${line}`);
    }
  }
}

// ✅ SAFE JSON PARSER
function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON format');
    return JSON.parse(match[0]);
  }
}

// 🔁 RETRY WITH FIX PROMPT
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
      return fetchWithRetry(
        {
          ...body,
          messages: [
            ...body.messages,
            {
              role: 'user',
              content:
                'Fix previous output. Follow ALL rules strictly. Return valid JSON only.',
            },
          ],
        },
        retries - 1
      );
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
    model:'grok-4.1-fast', // 🔥 upgraded model
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Generate 3 viral food battles.' },
    ],
    temperature: 0.9,
    max_tokens: 1500,
    response_format: { type: 'json_object' }, // 🔥 force JSON
  });

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content from AI');
  }

  const parsed = safeParseJSON(content);

  if (!parsed.battles || !Array.isArray(parsed.battles)) {
    throw new Error('Invalid battles format');
  }

  // ✅ VALIDATE
  parsed.battles.forEach(validateBattle);

  return parsed.battles;
}

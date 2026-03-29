import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

// 🔥 UPDATED PROMPT (FOCUS ON CINEMATIC FACE-OFF, NO FIGHTING)
const SYSTEM_PROMPT = `
You are a viral short-form content scriptwriter.

Create intense FOOD BATTLES — direct confrontation, no narration.

STRUCTURE:
1. Hero attacks (health-based, aggressive)
2. Villain responds (tempting, teasing)
3. Hero finishes (final domination)

DIALOGUE RULES:
- Each line: 20–35 words
- Sounds like real human argument (NOT robotic)
- Emotional, punchy, viral
- No narration, only direct speaking

CHARACTER RULES:
- ONLY mention hero_food and villain_food
- NEVER introduce other foods

VISUAL STYLE (VERY IMPORTANT):

IMAGE PROMPT:
- 3D Pixar-style characters
- Hero and villain facing each other (face-off)
- NO fighting, NO physical attack
- Strong confrontation energy (eye contact, tension)
- Hero looks dominant and confident
- Villain looks slightly defensive but still cocky
- expressive faces
- cinematic lighting (soft glow, rim light)
- depth of field
- highly detailed textures
- environment matches scene (kitchen, grocery, mall, etc.)
- camera angle: slightly low angle for hero (to feel powerful)

VIDEO PROMPT:
- cinematic face-off moment (NOT action fight)
- slow camera push-in or orbit
- intense eye contact between characters
- subtle movement (breathing, slight gestures)
- dramatic lighting shifts
- emotional tension, not violence
- close-up shots alternating hero and villain
- feels like a heated argument scene before a fight (but no fight happens)

OUTPUT JSON:
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
`;

// ✅ SAFE PARSE
function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON');
    return JSON.parse(match[0]);
  }
}

// ✅ RELAXED VALIDATION
function validateBattle(battle: any) {
  const hero = battle.hero_food.toLowerCase();
  const villain = battle.villain_food.toLowerCase();

  for (const d of battle.dialogue) {
    const line = d.line.toLowerCase();

    if (d.speaker === "hero" && !line.includes(hero)) {
      throw new Error(`Hero mismatch: ${line}`);
    }

    if (d.speaker === "villain") {
      if (!line.includes(villain)) {
        console.warn("⚠️ Villain line doesn't include exact name:", line);
      }
    }
  }
}

// ✅ API CALL
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
        { role: 'user', content: 'Generate 3 viral food battles.' },
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

// 🚀 MAIN
export async function generateBattles(): Promise<FoodBattle[]> {
  if (!API_KEY) throw new Error('Missing API key');

  const data = await callAI();

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No AI response');

  const parsed = safeParse(content);

  if (!parsed.battles) throw new Error('Invalid structure');

  parsed.battles.forEach(validateBattle);

  return parsed.battles;
}

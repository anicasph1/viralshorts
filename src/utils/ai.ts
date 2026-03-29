import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

// ✅ CLEAN PROMPT (NO BUGS)
const SYSTEM_PROMPT = `
You are a viral short-form content scriptwriter.

Your job is to create intense FOOD BATTLES — NOT narration.

CRITICAL STRUCTURE:
- This is a FACE-OFF conversation, not storytelling
- Characters directly talk to each other
- NO narration, NO descriptions inside dialogue

DIALOGUE FLOW (STRICT):
1. HERO attacks first (health-based, aggressive, confident)
2. VILLAIN responds (defensive, teasing, persuasive, tempting)
3. HERO finishes (final domination line, powerful closing)

STYLE REQUIREMENTS:
- Each line = 20 to 35 words ONLY
- Sounds like REAL HUMAN TRASH TALK (not robotic)
- Punchy, emotional, viral
- Like TikTok / Shorts dialogue

CHARACTER PERSONALITY:
- HERO → exposes health benefits, shames junk food
- VILLAIN → tempting, addictive, manipulative, slightly insecure but cocky

IMPORTANT RULES:
- ONLY mention hero_food and villain_food
- NEVER introduce other foods
- Dialogue must match the characters EXACTLY

EXAMPLE STYLE:
Hero: "You're just empty calories pretending to be food—I'm real fuel, real strength, the reason bodies perform instead of slowly breaking down like you."
Villain: "Please, I taste better and people actually crave me—you're just a boring health lecture no one enjoys."
Hero: "They crave you because you're addictive, not because you're good—I'm what keeps them alive, strong, and winning long after you destroy them."

OUTPUT FORMAT (STRICT JSON):
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

IMAGE PROMPT STYLE (VERY IMPORTANT):
- 3D Pixar-style cinematic characters
- expressive faces (hero dominant, villain scared)
- dramatic lighting, volumetric light
- action pose (pointing, attacking, overpowering)
- detailed textures
- depth of field
- environment matches scene (mall, kitchen, grocery, etc.)

VIDEO PROMPT:
- cinematic confrontation
- slow motion + aggressive movement
- emotional intensity
- camera close-ups and dynamic angles

FINAL RULE:
If dialogue sounds like narration → INVALID
If lines are too long → INVALID
If wrong food mentioned → INVALID
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

    // ✅ dapat may kahit isang tamang food
    if (!line.includes(hero) && !line.includes(villain)) {
      throw new Error(`Unknown food: ${line}`);
    }

    // ✅ speaker consistency (soft check)
    if (d.speaker === 'hero' && !line.includes(hero)) {
      console.warn('Hero line weak match:', line);
    }

    if (d.speaker === 'villain' && !line.includes(villain)) {
      console.warn('Villain line weak match:', line);
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

import type { FoodBattle } from '@/types';

const API_KEY = import.meta.env.VITE_AICC_API_KEY;
const BASE_URL = 'https://api.ai.cc/v1';

// ✅ CLEAN PROMPT (NO BUGS)
const SYSTEM_PROMPT = `
Generate 3 high-quality food debate scenarios.

CORE RULES:

- Each battle must have ONLY 2 foods:
  - hero_food
  - villain_food

- Do NOT mention any other food anywhere.

- Use natural and realistic food names.
- Do NOT add titles, powers, or fantasy words.
- Use a wide variety of foods (fruits, vegetables, meals, snacks, fast food).

LOCATION RULES:

- Each battle must happen in ONLY ONE place:
  - mall food court
  - grocery aisle
  - kitchen counter

- Do NOT change location.
- The same location must be reflected in:
  - scene
  - image_prompt
  - video_prompt

DEBATE STRUCTURE (STRICT):

- EXACTLY 3 dialogue lines ONLY:

1. hero speaks  
   - strong opening  
   - confident tone  

2. villain speaks  
   - smart comeback  
   - defensive but not weak  

3. hero speaks  
   - final line  
   - clearly wins the debate  

DIALOGUE STYLE:

- Each line must be LONG (1–2 sentences, paragraph style)
- Each line MUST include the speaker's food name
- No physical fighting — only verbal debate
- Natural human tone (not robotic)
- Clear, punchy, slightly emotional delivery

TONE:

- hero = confident, dominant, composed
- villain = defensive, witty, slightly sarcastic

OUTPUT RULES:

- Return ONLY valid JSON
- No explanation
- No extra text

FORMAT:

{
  "battles": [
    {
      "title": "short catchy debate title",
      "scene": "mall food court OR grocery aisle OR kitchen counter",
      "hero_food": "real food name",
      "villain_food": "real food name",
      "dialogue": [
        { "speaker": "hero", "line": "Hero_food long confident line..." },
        { "speaker": "villain", "line": "Villain_food smart comeback line..." },
        { "speaker": "hero", "line": "Hero_food final winning line..." }
      ],
      "image_prompt": "3D Pixar-style {hero_food} and {villain_food} as characters in {scene}, standing face-to-face, expressive emotions, soft cinematic lighting, realistic environment, depth of field",
      "video_prompt": "cinematic close-up of {hero_food} and {villain_food} debating in {scene}, minimal movement, expressive gestures, dialogue-focused scene, shallow depth of field, calm but dramatic mood",
      "seo_keywords": ["food debate", "viral shorts", "healthy vs junk"]
    }
  ]
}

FINAL VALIDATION:

- Exactly 3 dialogue lines
- Hero speaks first and last
- Each line includes the correct food name
- No other food is mentioned anywhere
- Location is consistent across scene, image_prompt, and video_prompt
- Dialogue is paragraph-style (not short phrases)

If any rule is broken, regenerate internally.

Return JSON only.
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

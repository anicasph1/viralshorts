import type { FoodBattle } from '@/types';

const SYSTEM_PROMPT = `
You are a world-class AI content generator with ChatGPT-level writing quality.

STYLE:
- Cinematic
- Emotionally engaging
- Highly structured
- Natural human dialogue (NOT robotic)
- Viral, punchy, short-form optimized

TASK:
Generate 3 UNIQUE food battle scenarios.

FORMAT RULES (STRICT):
- Output MUST be valid JSON only
- No explanations, no markdown, no extra text
- Follow the structure EXACTLY

CONTENT RULES:
- HERO = healthy food (broccoli, avocado, salmon, etc.)
- VILLAIN = junk food (burger, fries, soda, etc.)
- Dialogue must feel like real speech
- Hero = dominant, confident, savage
- Villain = defensive, funny, slightly scared

DIALOGUE RULES:
- EXACTLY 3 lines
- EACH line = 20 to 35 words
- Must sound like spoken dialogue (not narration)

VISUAL RULES:
Image + Video prompts MUST include:
"cinematic 3D Pixar-style animation, dramatic lighting, soft shadows, depth of field, ultra-detailed textures, expressive characters"

OUTPUT FORMAT:
{
  "battles": [
    {
      "title": "VERY catchy viral title",
      "scene": "cinematic environment description",
      "hero_food": "name",
      "villain_food": "name",
      "dialogue": [
        { "speaker": "hero", "line": "..." },
        { "speaker": "villain", "line": "..." },
        { "speaker": "hero", "line": "..." }
      ],
      "image_prompt": "...",
      "video_prompt": "...",
      "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
  ]
}
`;

export async function generateBattles(): Promise<FoodBattle[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // 🔥 SAFE EXTRACTION (para hindi ka mag crash)
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from AI');
  }

  // 🔥 MAS MATIBAY NA JSON PARSER
  const jsonMatch =
    content.match(/```json\n?([\s\S]*?)\n?```/) ||
    content.match(/```\n?([\s\S]*?)\n?```/) ||
    content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("RAW AI RESPONSE:", content);
    throw new Error('Could not extract JSON from AI response');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.battles || !Array.isArray(parsed.battles)) {
      throw new Error('Invalid response format: battles array missing');
    }

    return parsed.battles;

  } catch (err) {
    console.error("PARSE ERROR:", content);
    throw new Error('Failed to parse AI JSON');
  }
}

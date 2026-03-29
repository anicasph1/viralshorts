import type { FoodBattle } from '@/types';

const SYSTEM_PROMPT = `You are a viral content creator specializing in food battle scripts for short-form videos.

Generate 3 unique food battle scenarios where:
- HERO = healthy food (e.g., broccoli, avocado, quinoa, kale, salmon)
- VILLAIN = junk food (e.g., burger, pizza, fries, donut, soda)

Each battle must include:
1. A catchy viral title
2. A scene description (cinematic setting)
3. Hero food name
4. Villain food name
5. EXACTLY 3 dialogue lines:
   - Line 1: Hero (aggressive, confident, calling out the villain)
   - Line 2: Villain (defensive, funny, slightly scared but trying to be tough)
   - Line 3: Hero (final domination, epic closing line)
6. Image prompt for 3D Pixar-style cinematic render
7. Video prompt for cinematic scene description
8. SEO keywords array (5-7 tags)

Rules for dialogue:
- Each line must be 20-35 words
- Cinematic, dramatic tone
- Viral short style ( punchy, memorable)
- Hero lines should be empowering and savage
- Villain lines should be humorous but pathetic

Output ONLY a valid JSON object with this exact structure:
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
}`;

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
        { role: 'user', content: 'Generate 3 viral food battle scripts with unique healthy vs junk food matchups. Make them epic and shareable!' }
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
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid API response structure');
  }

  const content = data.choices[0].message.content;
  
  // Extract JSON from the response (handle potential markdown code blocks)
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                    content.match(/```\n?([\s\S]*?)\n?```/) ||
                    [null, content];
  
  const jsonString = jsonMatch[1] || content;
  
  try {
    const parsed = JSON.parse(jsonString.trim());
    if (!parsed.battles || !Array.isArray(parsed.battles)) {
      throw new Error('Invalid response format: battles array not found');
    }
    return parsed.battles;
  } catch (parseError) {
    throw new Error(`Failed to parse AI response: ${parseError}`);
  }
}

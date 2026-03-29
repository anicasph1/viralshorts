export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    // 🔥 IMPORTANT DEBUG
    console.log("RAW OPENAI RESPONSE:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON from OpenAI",
        raw: text
      });
    }

    // 🔥 CHECK kung may choices
    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({
        error: "No content returned from OpenAI",
        full_response: data
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("FETCH ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message || "fetch failed"
    });
  }
}

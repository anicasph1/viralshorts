export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.VITE_AICC_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    const response = await fetch("https://api.aicc.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    // debug logging
    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("FETCH ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message || "fetch failed"
    });
  }
}

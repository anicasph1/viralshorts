export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🔥 HARDCODED API KEY (TEMP FIX)
  const API_KEY = "sk-Z7oJKkBwnK8fgrv4qWWoVic0sZVgnIdfxwWEJfwGFRQd47yX";

  try {
    // Validate body
    if (!req.body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const response = await fetch("https://api.aicc.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    console.log("🔥 AICC RAW RESPONSE:", text);

    // Try parse JSON safely
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: "Invalid JSON from API",
        raw: text,
      });
    }

    // If AICC returned error
    if (!response.ok) {
      return res.status(response.status).json({
        error: "AICC API Error",
        details: data,
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("❌ FETCH ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message || "fetch failed",
    });
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = "sk-Z7oJKkBwnK8fgrv4qWWoVic0sZVgnIdfxwWEJfwGFRQd47yX";

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

    console.log("RAW:", text);

    return res.status(200).send(text);

  } catch (error: any) {
    console.error("FETCH ERROR:", error);

    return res.status(500).json({
      error: "fetch failed",
      message: error.message,
    });
  }
}

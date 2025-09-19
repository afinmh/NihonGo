export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = (req.body || {}) as { prompt?: string };
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing MISTRAL_API_KEY' });

    const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 160,
        stream: false,
      }),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'Mistral error', details: text });
    }

    const json = await r.json();
    const reply = json?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}

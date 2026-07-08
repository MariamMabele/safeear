const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'Missing ANTHROPIC_API_KEY in Netlify environment variables' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const text = String(payload.text || '').trim();
  const clientLang = String(payload.clientLang || 'French').trim();
  const direction = payload.direction === 'to-english' ? 'to-english' : 'to-client';

  if (!text) {
    return json(400, { error: 'Text is required' });
  }

  if (text.length > 4000) {
    return json(400, { error: 'Message is too long' });
  }

  const system = direction === 'to-client'
    ? `You are an empathetic translator for SafeEar, a mental wellness listening service. Translate the following English text to ${clientLang}. The translation must be warm, caring, and emotionally sensitive. Return only the translated text.`
    : `You are an empathetic translator for SafeEar, a mental wellness listening service. Translate the following ${clientLang} text to English. Preserve the emotional tone. Return only the translated text.`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return json(response.status, { error: data.error?.message || 'Translation service failed' });
    }

    return json(200, { translated: data.content?.[0]?.text || '' });
  } catch {
    return json(502, { error: 'Translation service unavailable' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  };
}

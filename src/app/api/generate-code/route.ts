import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful coding assistant. Only return code, no explanations.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  const code = data.choices?.[0]?.message?.content || '';
  return NextResponse.json({ code });
} 
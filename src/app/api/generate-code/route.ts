import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, mode } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  let systemMessage = '';
  if (mode === 'code') {
    systemMessage = `
      You are a coding assistant for a website builder. 
      When the user asks for a feature, return three separate code blocks: 
      1. HTML (inside <html>...</html>), 
      2. CSS (inside <style>...</style>), 
      3. JavaScript (inside <script>...</script>).
      Do not include explanations, only the code blocks.
    `;
  } else {
    systemMessage = `
      You are a coding assistant for a website builder. 
      When the user asks for a feature, return a single React component using JSX. 
      Do not include explanations, only the code.
    `;
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: systemMessage + '\n' + prompt }] }
      ]
    }),
  });

  const data = await response.json();
  const code = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return NextResponse.json({ code });
}

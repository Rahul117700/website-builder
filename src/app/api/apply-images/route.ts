import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { htmlCode, cssCode, imageLinks } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // Validate input
  if (!htmlCode || typeof htmlCode !== 'string') {
    return NextResponse.json({ error: 'Invalid HTML code' }, { status: 400 });
  }

  if (!imageLinks || typeof imageLinks !== 'object') {
    return NextResponse.json({ error: 'Invalid image links' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  // Convert image links to a readable format for the AI
  const imageList = Object.entries(imageLinks)
    .filter(([_, url]) => url && typeof url === 'string' && url.trim())
    .map(([desc, url]) => `${desc}: ${url}`)
    .join('\n');

  if (!imageList) {
    return NextResponse.json({ error: 'No valid image links provided' }, { status: 400 });
  }

  const systemMessage = `
    You are an AI assistant that integrates images into HTML and CSS code.
    You will be given HTML code, CSS code, and a list of image links with descriptions.
    
    Your task:
    1. Replace placeholder images, generic images, or add images where appropriate in the HTML
    2. Update CSS if needed to style the images properly
    3. Ensure images are responsive and well-integrated
    4. Use proper alt text for accessibility
    5. Maintain the existing structure and styling
    
    Return the response in this exact format:
    HTML:
    [updated HTML code]
    
    CSS:
    [updated CSS code]
    
    Do not include explanations, only the code blocks.
  `;

  const userPrompt = `
    Current HTML:
    ${htmlCode}
    
    Current CSS:
    ${cssCode || ''}
    
    Available Images:
    ${imageList}
    
    Please integrate these images into the HTML and update CSS as needed.
  `;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: systemMessage + '\n\n' + userPrompt }] }
        ]
      }),
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract HTML and CSS from the response
    let html = htmlCode; // fallback to original
    let css = cssCode || ''; // fallback to original
    
    // Try to extract HTML block
    const htmlMatch = aiResponse.match(/HTML:\s*\n([\s\S]*?)(?=\n\s*CSS:|$)/i);
    if (htmlMatch) {
      html = htmlMatch[1].trim();
    }
    
    // Try to extract CSS block
    const cssMatch = aiResponse.match(/CSS:\s*\n([\s\S]*?)$/i);
    if (cssMatch) {
      css = cssMatch[1].trim();
    }
    
    return NextResponse.json({ html, css });
  } catch (error) {
    console.error('Error applying images:', error);
    return NextResponse.json({ error: 'Failed to apply images' }, { status: 500 });
  }
}